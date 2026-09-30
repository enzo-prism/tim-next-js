# Independent delivery monitoring

Run `scripts/monitor-lead-health.mjs` on an operator-owned host outside the website deployment and its database. This is the primary delivery monitor: it can notify an external receiver even when the website, database, or health endpoint is unavailable. The website's database-backed alert sender cannot notify a database outage on its own.

Configure these environment variables on that host, using its secret manager or a private environment file:

| Variable | Value |
| --- | --- |
| `LEAD_HEALTH_MONITOR_URL` | `https://www.famfirstsmile.com/api/admin/lead-health` |
| `CRON_SECRET` | The website's matching bearer secret, at least 32 characters |
| `LEAD_HEALTH_ALERT_WEBHOOK_URL` | An HTTPS receiver outside the website deployment; it must deliver to the operator and return a success status only after accepting the alert |
| `LEAD_HEALTH_MONITOR_STATE_FILE` | An absolute path on a persistent operator-owned filesystem, for example `/var/lib/ffsc-monitor/state.json` |

Create the state directory beforehand, owned by the account running the monitor. The script will not create a directory or silently write into its current working directory. State contains only a version, issue-code fingerprint, and timestamp. Writes use a private temporary file and atomic replacement. Keep the same state file across executions; an ephemeral filesystem would repeat degraded alerts.

Run with Node 20.9 or newer:

```sh
node /opt/ffsc/scripts/monitor-lead-health.mjs
```

Schedule this command every 15 minutes using an independent scheduler or cron. For example, after supplying the variables securely in the runner's environment:

```cron
*/15 * * * * /usr/bin/node /opt/ffsc/scripts/monitor-lead-health.mjs
```

The receiver gets a JSON `subject`, `body`, and `metadata` object. It receives validated issue codes, generic operating guidance, and a timestamp. It receives no patient data, health-response body, authorization secret, or endpoint URL. The monitor rejects HTTP URLs, credential-bearing URLs, and redirects. Tests inject a fake fetch implementation and make no live requests.

An initial healthy check sends no alert and writes no state. A changed set of issues sends one alert; an unchanged condition stays quiet. Recovery sends one alert after a recorded degraded condition. State advances only after the receiver accepts the alert. A rejected/timed-out alert is retried on the next execution. Without provider-supported idempotency, acceptance followed by a timeout or failed state write can cause a repeated alert; scheduler failure reporting surfaces these failures.

Use this independent sender as the primary notification channel. Leave `LEAD_HEALTH_ALERT_WEBHOOK_URL` unset **on Vercel** to avoid two senders notifying the same receiver. Setting it on the external host does not set it on the website. If both channels are intentionally enabled, expect each sender to report changes independently.

Exit `0` means healthy; exit `1` means degraded, including after a successfully delivered alert; exit `2` means a monitor/configuration/state/receiver failure. Configure scheduler-level reporting for exit `2` and missed executions, since the monitor cannot notify through an unavailable receiver. A lock prevents overlapping runs. If a process is forcibly stopped, confirm it is no longer running before removing the adjacent `.lock` file; do not delete the state file to clear an incident.

Test without live traffic:

```sh
node --test scripts/monitor-lead-health.node-test.mjs
```
