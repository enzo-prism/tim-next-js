export interface Review {
  name: string;
  rating: number;
  text: string;
  ownerReply?: string;
  isComplete: boolean; // false if review text is truncated
}

export interface ServiceReviews {
  serviceId: string;
  reviews: Review[];
}

export const googleBusinessProfileUrl = "https://share.google/DP6ywkAGrYi3gCyEA";

export const serviceReviews: ServiceReviews[] = [
  {
    serviceId: "restorative-dentistry",
    reviews: [
      {
        name: "Elsie C",
        rating: 5,
        text: "Thank you. I appreciate your attention to detail.",
        ownerReply: "It's our pleasure to help you make your smile whole again!",
        isComplete: true
      },
      {
        name: "Tim Lee",
        rating: 5,
        text: "I want to thank Dr. Chuang for doing a good job on doing a crown on my molar. The molar had a filling that was worn out....",
        isComplete: false
      }
    ]
  },
  {
    serviceId: "invisalign",
    reviews: [
      {
        name: "Jinny",
        rating: 5,
        text: "I'm so glad I was referred to Dr. Chuang! I wanted some minor tweaks to my smile and he was able to help me achieve my...",
        isComplete: false
      }
    ]
  },
  {
    serviceId: "teeth-whitening",
    reviews: [
      {
        name: "Jinny",
        rating: 5,
        text: "I'm so glad I was referred to Dr. Chuang! I wanted some minor tweaks to my smile and he was able to help me achieve my...",
        isComplete: false
      }
    ]
  },
  {
    serviceId: "tmj",
    reviews: [
      {
        name: "Paula Gregoire",
        rating: 5,
        text: "It has been such a pleasure meeting Dr. Chuang and getting an actual treatment plan to help with my TMJ. He constructed...",
        isComplete: false
      }
    ]
  },
  {
    serviceId: "night-guards",
    reviews: [
      {
        name: "Paula Gregoire",
        rating: 5,
        text: "It has been such a pleasure meeting Dr. Chuang and getting an actual treatment plan to help with my TMJ. He constructed...",
        isComplete: false
      }
    ]
  },
  {
    serviceId: "children-dentistry",
    reviews: [
      {
        name: "Priscilla Barajas",
        rating: 5,
        text: "I can't say enough wonderful things about Dr. Chuang and the staff at this office. Georgia has been more than incredible. They have treated my entire family of seven with so much kindness, patience, and care. Every visit feels comfortable, and they always go above and beyond to make sure each one of us - from the youngest to the oldest - is taken care of. My husband and I truly love going here, and we trust them completely. They do an amazing job every single time, and it's clear they genuinely care about their patients' well-being. Our kids actually enjoy going to the dentist now, which says everything! This will absolutely be our family dentist from now on, and I highly recommend them to anyone who has children of any age - or anyone who wants a dentist who treats you like family. We are so grateful to have found them!",
        isComplete: true
      },
      {
        name: "Kevin Lan",
        rating: 5,
        text: "Dr. Chuang was great for my 2-year-old daughter's first dental visit. He was patient, fun and knew how to interact with...",
        isComplete: false
      }
    ]
  },
  {
    serviceId: "dental-exams",
    reviews: [
      {
        name: "Paula Kirkland",
        rating: 5,
        text: "My dentist retired so I had the daunting task of finding a new one and I just had my first appointment with Dr. Chuang...",
        isComplete: false
      },
      {
        name: "Veronica Koh",
        rating: 5,
        text: "I highly recommend Dr. Chuang to anyone looking for a trustworthy dentist. He took the time to explain everything...",
        isComplete: false
      },
      {
        name: "Zach Reece",
        rating: 5,
        text: "Tim and the team here are great. He is patient, transparent, and took time to explain things to me. Definitely would recommend.",
        isComplete: true
      }
    ]
  },
  {
    serviceId: "dental-hygiene",
    reviews: [
      {
        name: "Monica Lee",
        rating: 5,
        text: "Dr. Chuang is stellar and provides great service! He was very patient and walked me through every step of my annual cleaning :) Highly recommend...",
        isComplete: false
      },
      {
        name: "Iuliia Zonova",
        rating: 5,
        text: "Very polite staff and so gentle cleaning! Highly recommend!",
        isComplete: true
      },
      {
        name: "Don Goers",
        rating: 5,
        text: "Cleanings have been a breeze with a fun staff and a knowledgeable and laid back Doctor leading the team.",
        isComplete: true
      },
      {
        name: "Jorden Groenink",
        rating: 5,
        text: "Great staff and thorough service.",
        isComplete: true
      }
    ]
  },
  {
    serviceId: "general-family-dentistry",
    reviews: [
      {
        name: "Jon Takagi",
        rating: 5,
        text: "I recommend Family First Smile Care for anyone's dental needs. Dr. Chuang and his staff are very friendly and were quick...",
        isComplete: false
      },
      {
        name: "Lew Ammann",
        rating: 5,
        text: "I was extremely pleased with the service and care I received at Dr. Chuang's office this past Tuesday....",
        isComplete: false
      },
      {
        name: "Davy H",
        rating: 5,
        text: "Dr. Chuang's clinic is welcoming, professional, and truly caring. His team provides attentive, personalized care with expertise and kindness. I highly recommend.",
        isComplete: true
      },
      {
        name: "Tiecheng Yang",
        rating: 5,
        text: "Great dental clinic! Dr Chuang and his team are friendly and professional. My treatment was smooth and painless. Highly recommended!",
        isComplete: true
      },
      {
        name: "Susan Tjoflat",
        rating: 5,
        text: "Dr. Chuang was very knowledgeable, professional, and helpful. Highly recommend him.",
        isComplete: true
      },
      {
        name: "Chai Ying Lim",
        rating: 5,
        text: "Definitely very professional and caring Dr.",
        isComplete: true
      },
      {
        name: "Lan Wang",
        rating: 5,
        text: "Great experience, I trust Dr. Chuang for his professionalism!",
        isComplete: true
      }
    ]
  }
];

// Reviews to show across multiple services or as general testimonials
export const generalReviews: Review[] = [
  {
    name: "Priscilla Barajas",
    rating: 5,
    text: "I can't say enough wonderful things about Dr. Chuang and the staff at this office. Georgia has been more than incredible. They have treated my entire family of seven with so much kindness, patience, and care. Every visit feels comfortable, and they always go above and beyond to make sure each one of us - from the youngest to the oldest - is taken care of. My husband and I truly love going here, and we trust them completely. They do an amazing job every single time, and it's clear they genuinely care about their patients' well-being. Our kids actually enjoy going to the dentist now, which says everything! This will absolutely be our family dentist from now on, and I highly recommend them to anyone who has children of any age - or anyone who wants a dentist who treats you like family. We are so grateful to have found them!",
    isComplete: true
  },
  {
    name: "Don Spingola",
    rating: 5,
    text: "I couldn't be happier with my experience with Dr. Chuang and his staff. They are kind, gentle, and patient especially...",
    isComplete: false
  },
  {
    name: "Angie Tran",
    rating: 5,
    text: "Dr. Chuang & his teams are professional, caring & friendly. He explains every procedure in detail...",
    isComplete: false
  },
  {
    name: "Janis Peace",
    rating: 5,
    text: "Really wonderful. Extremely attentive. Highly recommend him!!",
    isComplete: true
  },
  {
    name: "Goretti Shifman",
    rating: 5,
    text: "Every time I go into this Dental office I receive Excelente service and fantastic care.",
    isComplete: true
  },
  {
    name: "Josephine Lan",
    rating: 5,
    text: "I had a wonderful experience at this establishment. Dr. Chuang is warm, knowledgeable, and incredibly patient...",
    isComplete: false
  },
  {
    name: "Chloe Yue",
    rating: 5,
    text: "We moved to Bay mid of last year and Family First Smile Care was the first and ideal dental care that we feel...",
    isComplete: false
  },
  {
    name: "Janey Lee",
    rating: 5,
    text: "I have some dental anxiety and Dr. Chuang is always readily available with solid advice and a reassuring manner in...",
    isComplete: false
  },
  {
    name: "Iya Browne",
    rating: 5,
    text: "Dr. Chuang is a great doctor. I really enjoyed coming to my appointments because I know that I will get a quality...",
    isComplete: false
  },
  {
    name: "Michael Lee",
    rating: 5,
    text: "I have not been to the dentist since relocating to the South Bay so I decided to give Family First Smile Care a try and...",
    isComplete: false
  },
  {
    name: "Lydia Mejia",
    rating: 5,
    text: "Very personalized, the office staff and Dr. Pleasant caring care.",
    isComplete: true
  },
  {
    name: "Abel Martinez",
    rating: 5,
    text: "Excellant work by Dds Chiang and his Assistants!!!",
    isComplete: true
  }
];
