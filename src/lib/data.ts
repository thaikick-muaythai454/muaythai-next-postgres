/**
 * Hardcoded Data
 * ข้อมูล hardcode สำหรับแสดงผลในแอพพลิเคชั่น
 */

import { Gym, Event, Product, TrainingPackage, Article } from "@/types";

// Training Packages
export const PACKAGES: TrainingPackage[] = [
  {
    id: 1,
    name: "1 Day Pass",
    duration_days: 1,
    base_price: 500,
    description: "Single day training pass",
    inclusions: ["Training session", "Equipment use"],
  },
  {
    id: 2,
    name: "1 Week Pass",
    duration_days: 7,
    base_price: 3000,
    description: "One week training pass",
    inclusions: ["Training sessions", "Equipment use", "Towel service"],
  },
  {
    id: 3,
    name: "1 Month Pass",
    duration_days: 30,
    base_price: 10000,
    description: "One month unlimited training",
    inclusions: [
      "Unlimited training",
      "Equipment use",
      "Towel service",
      "Nutrition consultation",
    ],
  },
];

// Gyms
export const GYMS: Gym[] = [
  {
    id: "1",
    slug: "lumpinee-boxing-stadium",
    gym_name: "สนามมวยลุมพินี",
    gym_name_english: "Lumpinee Boxing Stadium",
    address: "6 Rama IV Road, Thung Maha Mek, Sathon, Bangkok 10120",
    gym_details:
      "One of the most prestigious Muay Thai stadiums in Thailand. Training facility with world-class trainers.",
    socials: "facebook.com/lumpinee",
    gym_type: "Professional",
    packages: PACKAGES,
  },
  {
    id: "2",
    slug: "fairtex-training-center",
    gym_name: "ค่ายมวยแฟร์เท็กซ์",
    gym_name_english: "Fairtex Training Center",
    address: "221/12 Moo 1, Bang Pla, Bang Phli, Samut Prakan 10540",
    gym_details:
      "World-renowned Muay Thai training camp. Fairtex has produced many champions.",
    socials: "facebook.com/fairtex",
    gym_type: "Professional",
    packages: PACKAGES,
  },
  {
    id: "3",
    slug: "tiger-muay-thai",
    gym_name: "ไทเกอร์ มวยไทย",
    gym_name_english: "Tiger Muay Thai",
    address: "7/11 Moo 5, Soi Ta-iad, Chalong, Phuket 83130",
    gym_details:
      "Located in Phuket, Tiger Muay Thai is one of the largest and most famous training camps in the world.",
    socials: "facebook.com/tigermuaythai",
    gym_type: "Professional",
    packages: PACKAGES,
  },
  {
    id: "4",
    slug: "petchyindee-academy",
    gym_name: "สถาบันเพชรยินดี",
    gym_name_english: "Petchyindee Academy",
    address: "123 Rama IV Road, Bangkok 10110",
    gym_details:
      "Historic gym with a legacy of producing top fighters. Traditional training methods combined with modern facilities.",
    socials: "facebook.com/petchyindee",
    gym_type: "Professional",
    packages: PACKAGES,
  },
];

// Events
export const EVENTS: Event[] = [
  {
    id: 1,
    slug: "one-championship-bangkok",
    name: "ONE Championship: Bangkok Fight Night",
    date: "2025-11-15T19:00:00.000Z",
    location: "Impact Arena, Bangkok",
    details:
      "Experience the best of Muay Thai and mixed martial arts at ONE Championship. World-class fighters compete for glory.",
    price: 1500,
    image: undefined,
  },
  {
    id: 2,
    slug: "lumpinee-friday-fights",
    name: "Lumpinee Stadium Friday Fights",
    date: "2025-10-25T18:00:00.000Z",
    location: "Lumpinee Boxing Stadium, Bangkok",
    details:
      "Traditional Muay Thai fights at the legendary Lumpinee Stadium. Every Friday night features top Thai fighters.",
    price: 800,
    image: undefined,
  },
  {
    id: 3,
    slug: "rajadamnern-championship",
    name: "Rajadamnern Stadium Championship",
    date: "2025-11-01T19:00:00.000Z",
    location: "Rajadamnern Stadium, Bangkok",
    details:
      "Championship fights at the historic Rajadamnern Stadium. Watch rising stars and established champions battle it out.",
    price: 1000,
    image: undefined,
  },
  {
    id: 4,
    slug: "thai-fight-phuket",
    name: "Thai Fight: Phuket Showdown",
    date: "2025-12-05T20:00:00.000Z",
    location: "Phuket Provincial Stadium",
    details:
      "Thai Fight brings exciting Muay Thai action to Phuket. International and Thai fighters compete in spectacular matches.",
    price: 1200,
    image: undefined,
  },
];

// Products
export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "fairtex-boxing-gloves-bgv1",
    nameThai: "นักชกถุงมือแฟร์เท็กซ์ BGV1",
    nameEnglish: "Fairtex Boxing Gloves BGV1",
    description:
      "Premium leather boxing gloves. Perfect for training and sparring.",
    price: 2500,
    stock: 50,
    category: "Equipment",
    image: undefined,
  },
  {
    id: 2,
    slug: "twins-special-shin-guards",
    nameThai: "สนับแข้ง Twins Special",
    nameEnglish: "Twins Special Shin Guards",
    description:
      "High-quality shin guards for Muay Thai training. Maximum protection.",
    price: 1800,
    stock: 30,
    category: "Equipment",
    image: undefined,
  },
  {
    id: 3,
    slug: "muay-thai-shorts-red",
    nameThai: "กางเกงมวยไทย สีแดง",
    nameEnglish: "Traditional Muay Thai Shorts - Red",
    description: "Authentic Thai-style fight shorts. Comfortable and durable.",
    price: 800,
    stock: 100,
    category: "Apparel",
    image: undefined,
  },
  {
    id: 4,
    slug: "hand-wraps-180-inch",
    nameThai: "ผ้าพันมือ 180 นิ้ว",
    nameEnglish: "Hand Wraps 180 inch",
    description: "Professional hand wraps. Essential for hand protection.",
    price: 200,
    stock: 200,
    category: "Equipment",
    image: undefined,
  },
  {
    id: 5,
    slug: "thai-oil-liniment",
    nameThai: "น้ำมันนวดไทย",
    nameEnglish: "Thai Boxing Liniment Oil",
    description: "Traditional Thai oil for warming up muscles before training.",
    price: 150,
    stock: 150,
    category: "Wellness",
    image: undefined,
  },
  {
    id: 6,
    slug: "heavy-bag-120cm",
    nameThai: "กระสอบทราย 120 ซม.",
    nameEnglish: "Heavy Bag 120cm",
    description: "Professional heavy bag for home or gym training.",
    price: 5500,
    stock: 15,
    category: "Equipment",
    image: undefined,
  },
];

// Articles
export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "muay-thai-history-traditions",
    title: "ประวัติและประเพณีมวยไทย: ศิลปะการต่อสู้ที่สืบทอดมาหลายศตวรรษ",
    excerpt: "มวยไทยเป็นมรดกทางวัฒนธรรมที่สำคัญของประเทศไทย เรียนรู้ประวัติศาสตร์และประเพณีอันยาวนานของศิลปะการต่อสู้นี้",
    content: `มวยไทยมีประวัติความเป็นมายาวนานหลายศตวรรษ เริ่มต้นจากการต่อสู้ป้องกันตัวของทหารไทยโบราณในสมัยสุโขทัย และพัฒนามาเป็นศิลปะการต่อสู้ที่สมบูรณ์แบบในสมัยอยุธยา

ในสมัยโบราณ มวยไทยถูกใช้เป็นเครื่องมือในการฝึกทหารเพื่อการป้องกันประเทศ การฝึกมวยไทยในสมัยนั้นรวมถึงการใช้อาวุธต่างๆ เช่น ดาบ หอก และโล่ ซึ่งทำให้มวยไทยมีความหลากหลายในเทคนิคการต่อสู้

ประเพณีสำคัญของมวยไทยคือการไหว้ครู ซึ่งเป็นพิธีกรรมที่แสดงความเคารพต่อครูผู้สอนและบรรพบุรุษ นักมวยจะสวมมงคลศีรษะและผ้าคาดเอวสีแดงหรือสีขาว เพื่อแสดงถึงความบริสุทธิ์และความกล้าหาญ

การไหว้ครูประกอบด้วยการรำไหว้ครู ซึ่งเป็นการแสดงท่าทางที่สวยงามและมีความหมายลึกซึ้ง แต่ละท่าจะมีความหมายที่แตกต่างกัน เช่น การไหว้ครูเพื่อขอพร การไหว้ครูเพื่อแสดงความเคารพ และการไหว้ครูเพื่อขออภัย

มวยไทยในปัจจุบันยังคงรักษาประเพณีและวัฒนธรรมดั้งเดิมไว้อย่างเหนียวแน่น การฝึกมวยไทยไม่เพียงแต่เป็นการออกกำลังกาย แต่ยังเป็นการเรียนรู้วัฒนธรรมและประวัติศาสตร์ของชาติไทยด้วย

การแข่งขันมวยไทยในปัจจุบันมีการใช้กฎกติกาที่พัฒนามาจากประเพณีดั้งเดิม เช่น การไหว้ครูก่อนการแข่งขัน การสวมมงคลศีรษะ และการแสดงความเคารพต่อคู่ต่อสู้

มวยไทยได้กลายเป็นส่วนหนึ่งของวัฒนธรรมไทยที่ได้รับการยอมรับในระดับสากล และเป็นเครื่องมือในการเผยแพร่วัฒนธรรมไทยไปยังทั่วโลก`,
    author: "ครูมวย สมชาย",
    date: "2025-01-15",
    category: "ประวัติศาสตร์",
    tags: ["มวยไทย", "ประวัติศาสตร์", "วัฒนธรรม"],
  },
  {
    id: 2,
    slug: "basic-muay-thai-techniques",
    title: "เทคนิคพื้นฐานมวยไทยสำหรับผู้เริ่มต้น",
    excerpt: "คู่มือสำหรับผู้ที่สนใจเริ่มต้นฝึกมวยไทย พร้อมเทคนิคพื้นฐานที่ควรรู้",
    content: `การเริ่มต้นเรียนมวยไทยอาจดูยาก แต่ด้วยพื้นฐานที่ถูกต้อง คุณจะสามารถพัฒนาทักษะได้อย่างรวดเร็ว

เทคนิคพื้นฐานที่สำคัญที่สุดคือการยืนท่า (Stance) ซึ่งเป็นพื้นฐานของการเคลื่อนไหวทุกอย่างในมวยไทย ท่ายืนที่ถูกต้องจะช่วยให้คุณสามารถโจมตีและป้องกันได้อย่างมีประสิทธิภาพ

การชก (Punching) เป็นเทคนิคพื้นฐานที่ต้องฝึกฝนอย่างสม่ำเสมอ ประกอบด้วยการชกตรง (Jab), การชกหมุน (Cross), การชกฮุค (Hook), และการชกอัปเปอร์คัท (Uppercut)

การเตะ (Kicking) เป็นจุดเด่นของมวยไทย เริ่มจากการเตะต่ำ (Low Kick) เพื่อทำลายขาของคู่ต่อสู้ การเตะกลาง (Middle Kick) เพื่อโจมตีลำตัว และการเตะสูง (High Kick) เพื่อโจมตีศีรษะ

การใช้เข่า (Knee Strike) เป็นอาวุธที่ทรงพลังของมวยไทย สามารถใช้ในการต่อสู้ระยะใกล้ และเป็นเทคนิคที่ทำให้มวยไทยแตกต่างจากศิลปะการต่อสู้อื่นๆ

การใช้ศอก (Elbow Strike) เป็นเทคนิคที่อันตรายและมีประสิทธิภาพสูง สามารถใช้ในการต่อสู้ระยะใกล้ และเป็นจุดเด่นของมวยไทย

การป้องกัน (Defense) เป็นทักษะที่สำคัญไม่แพ้การโจมตี ประกอบด้วยการบล็อก การหลบ และการปัด ซึ่งต้องฝึกฝนควบคู่กับการโจมตี

การฝึกมวยไทยต้องเริ่มจากพื้นฐานที่ถูกต้อง และต้องมีความอดทนในการฝึกฝน อย่าคาดหวังผลลัพธ์ในระยะสั้น แต่ให้มุ่งมั่นในการพัฒนาทักษะอย่างต่อเนื่อง`,
    author: "ครูเทียน",
    date: "2025-01-10",
    category: "เทคนิค",
    tags: ["เทคนิค", "ผู้เริ่มต้น", "การฝึก"],
  },
  {
    id: 3,
    slug: "muay-thai-training-benefits",
    title: "5 ประโยชน์จากการฝึกมวยไทยที่คุณอาจไม่รู้",
    excerpt: "นอกจากการป้องกันตัว มวยไทยยังมีประโยชน์มากมายต่อสุขภาพและจิตใจ",
    content: `การฝึกมวยไทยไม่ได้ให้แค่ทักษะการต่อสู้เท่านั้น แต่ยังช่วยพัฒนาร่างกายและจิตใจอีกด้วย

1. การพัฒนาความแข็งแกร่งของร่างกาย
การฝึกมวยไทยช่วยพัฒนาความแข็งแกร่งของกล้ามเนื้อทุกส่วนของร่างกาย ตั้งแต่แขน ขา ไปจนถึงลำตัว การฝึกอย่างสม่ำเสมอจะทำให้ร่างกายแข็งแรงและทนทานมากขึ้น

2. การพัฒนาความยืดหยุ่นและความคล่องตัว
การฝึกมวยไทยต้องใช้การเคลื่อนไหวที่หลากหลาย ซึ่งช่วยพัฒนาความยืดหยุ่นของข้อต่อและกล้ามเนื้อ ทำให้ร่างกายเคลื่อนไหวได้อย่างคล่องแคล่ว

3. การพัฒนาความมั่นใจในตนเอง
การฝึกมวยไทยช่วยสร้างความมั่นใจในตนเอง เพราะคุณจะรู้สึกว่าสามารถปกป้องตนเองได้ และการเอาชนะความท้าทายในการฝึกจะทำให้คุณรู้สึกภาคภูมิใจ

4. การพัฒนาความอดทนและวินัย
การฝึกมวยไทยต้องใช้ความอดทนและวินัยในการฝึกฝนอย่างสม่ำเสมอ ซึ่งจะช่วยพัฒนาบุคลิกภาพและความรับผิดชอบ

5. การลดความเครียดและความวิตกกังวล
การออกกำลังกายด้วยมวยไทยช่วยปลดปล่อยความเครียดและความวิตกกังวล ทำให้จิตใจสงบและผ่อนคลายมากขึ้น

การฝึกมวยไทยเป็นกิจกรรมที่ให้ประโยชน์ทั้งทางร่างกายและจิตใจ เหมาะสำหรับทุกเพศทุกวัย และสามารถเริ่มต้นได้ในทุกช่วงอายุ`,
    author: "นายแพทย์วิชัย",
    date: "2025-01-05",
    category: "สุขภาพ",
    tags: ["สุขภาพ", "ออกกำลังกาย", "ประโยชน์"],
  },
  {
    id: 4,
    slug: "famous-muay-thai-fighters",
    title: "นักมวยไทยในตำนาน 10 อันดับ",
    excerpt: "รู้จักกับนักมวยไทยที่ยิ่งใหญ่ที่สุดในประวัติศาสตร์",
    content: `มวยไทยมีนักมวยที่ยิ่งใหญ่มากมายที่สร้างประวัติศาสตร์ให้กับวงการ

1. สมเด็จพระนเรศวรมหาราช - พระมหากษัตริย์ผู้ทรงเป็นนักรบที่ยิ่งใหญ่ที่สุดในประวัติศาสตร์ไทย ทรงใช้ศิลปะการต่อสู้ในการกู้เอกราช

2. ครูแจ่ม วัดสุทัศน์ - ครูมวยในตำนานผู้เป็นต้นแบบของศิลปะมวยไทยสมัยใหม่ มีลูกศิษย์มากมายที่กลายเป็นนักมวยชื่อดัง

3. ครูเทียน วัดลาดพร้าว - ครูมวยผู้เชี่ยวชาญด้านเทคนิคการต่อสู้ เป็นผู้พัฒนาระบบการฝึกมวยไทยให้เป็นระบบ

4. ครูสมชาย วัดพระธาตุ - ครูมวยผู้มีชื่อเสียงในด้านการฝึกนักมวยรุ่นใหม่ เป็นผู้สืบทอดศิลปะมวยไทยให้กับคนรุ่นหลัง

5. ครูวิชัย วัดอรุณ - ครูมวยผู้เชี่ยวชาญด้านการป้องกันตัว เป็นผู้พัฒนาระบบการฝึกมวยไทยเพื่อการป้องกันตัว

6. ครูสมศักดิ์ วัดพระแก้ว - ครูมวยผู้มีชื่อเสียงในด้านการฝึกนักมวยอาชีพ เป็นผู้ผลิตนักมวยแชมป์เปี้ยนหลายคน

7. ครูเทียน วัดสระเกศ - ครูมวยผู้เชี่ยวชาญด้านเทคนิคการเตะ เป็นผู้พัฒนาระบบการฝึกการเตะในมวยไทย

8. ครูสมชาย วัดพระสิงห์ - ครูมวยผู้มีชื่อเสียงในด้านการฝึกนักมวยหญิง เป็นผู้เปิดโอกาสให้ผู้หญิงได้ฝึกมวยไทย

9. ครูวิชัย วัดมหาธาตุ - ครูมวยผู้เชี่ยวชาญด้านการฝึกนักมวยเด็ก เป็นผู้พัฒนาระบบการฝึกมวยไทยสำหรับเด็ก

10. ครูสมศักดิ์ วัดพระธาตุ - ครูมวยผู้มีชื่อเสียงในด้านการฝึกนักมวยต่างชาติ เป็นผู้เผยแพร่มวยไทยไปยังต่างประเทศ

ครูมวยเหล่านี้ล้วนเป็นผู้สืบทอดและพัฒนาศิลปะมวยไทยให้คงอยู่มาจนถึงปัจจุบัน และเป็นแรงบันดาลใจให้กับนักมวยรุ่นใหม่`,
    author: "นักข่าวกีฬา สุรชัย",
    date: "2024-12-28",
    category: "บุคคล",
    tags: ["นักมวย", "ตำนาน", "แชมป์เปี้ยน"],
  },
  {
    id: 5,
    slug: "muay-thai-equipment-guide",
    title: "คู่มือเลือกซื้ออุปกรณ์มวยไทยสำหรับผู้เริ่มต้น",
    excerpt: "ไกด์สำหรับการเลือกซื้อนวม สนับแข้ง และอุปกรณ์จำเป็นอื่นๆ",
    content: `การเลือกอุปกรณ์มวยไทยที่เหมาะสมสำคัญมากสำหรับผู้เริ่มต้น เพราะอุปกรณ์ที่ดีจะช่วยให้การฝึกมีประสิทธิภาพและปลอดภัย

1. นวม (Boxing Gloves)
นวมเป็นอุปกรณ์ที่สำคัญที่สุด ควรเลือกขนาดที่เหมาะสมกับน้ำหนักตัว:
- น้ำหนัก 50-60 กก.: 12-14 ออนซ์
- น้ำหนัก 60-70 กก.: 14-16 ออนซ์  
- น้ำหนัก 70 กก.ขึ้นไป: 16 ออนซ์ขึ้นไป

2. สนับแข้ง (Shin Guards)
สนับแข้งช่วยป้องกันการบาดเจ็บจากการเตะ ควรเลือกที่:
- มีความหนาเพียงพอในการป้องกัน
- มีสายรัดที่แน่นและไม่หลุดง่าย
- มีขนาดที่เหมาะสมกับขา

3. ผ้าพันมือ (Hand Wraps)
ผ้าพันมือช่วยป้องกันข้อมือและกระดูกมือ ควรเลือก:
- ความยาว 180 นิ้ว สำหรับการพันมือที่สมบูรณ์
- วัสดุที่ยืดหยุ่นและระบายอากาศได้ดี
- สีที่ชอบเพื่อความสวยงาม

4. กระสอบทราย (Heavy Bag)
กระสอบทรายสำหรับฝึกซ้อมที่บ้าน ควรเลือก:
- น้ำหนักที่เหมาะสมกับระดับการฝึก
- วัสดุที่ทนทานและไม่แตกง่าย
- ขนาดที่เหมาะสมกับพื้นที่

5. อุปกรณ์ป้องกันอื่นๆ
- หมวกกันน็อค (Headgear) สำหรับการสแปร์ริ่ง
- ฟันยาง (Mouthguard) เพื่อป้องกันฟัน
- เป้ากระสอบ (Focus Mitts) สำหรับฝึกกับคู่ซ้อม

การดูแลรักษาอุปกรณ์
- ทำความสะอาดหลังการใช้งานทุกครั้ง
- เก็บในที่แห้งและมีอากาศถ่ายเท
- ตรวจสอบสภาพเป็นประจำ

การเลือกซื้ออุปกรณ์ควรคำนึงถึงคุณภาพมากกว่าราคา เพราะอุปกรณ์ที่ดีจะช่วยให้การฝึกมีประสิทธิภาพและปลอดภัย`,
    author: "ผู้เชี่ยวชาญอุปกรณ์ สมศักดิ์",
    date: "2024-12-20",
    category: "อุปกรณ์",
    tags: ["อุปกรณ์", "ผู้เริ่มต้น", "การซื้อ"],
  },
  {
    id: 6,
    slug: "muay-thai-diet-nutrition",
    title: "โภชนาการสำหรับนักมวยไทย: กินอย่างไรให้แข็งแรง",
    excerpt: "แนวทางการกินอาหารที่ถูกต้องสำหรับการฝึกมวยไทย",
    content: `โภชนาการที่ดีเป็นพื้นฐานสำคัญของการฝึกมวยไทยที่มีประสิทธิภาพ

อาหารหลักที่ควรรับประทาน

1. คาร์โบไฮเดรต
คาร์โบไฮเดรตเป็นแหล่งพลังงานหลักสำหรับการฝึกมวยไทย ควรรับประทาน:
- ข้าวกล้อง ข้าวซ้อมมือ
- ขนมปังโฮลวีท
- ผลไม้ เช่น กล้วย แอปเปิ้ล
- ผักใบเขียว

2. โปรตีน
โปรตีนช่วยในการซ่อมแซมและสร้างกล้ามเนื้อ ควรรับประทาน:
- เนื้อสัตว์ไม่ติดมัน เช่น เนื้อไก่ เนื้อปลา
- ไข่
- ถั่วเหลือง เต้าหู้
- นมและผลิตภัณฑ์จากนม

3. ไขมันดี
ไขมันดีช่วยในการดูดซึมวิตามินและให้พลังงาน ควรรับประทาน:
- น้ำมันมะกอก
- อะโวคาโด
- ถั่วต่างๆ
- ปลาทะเล

การดื่มน้ำ
การดื่มน้ำเพียงพอสำคัญมากสำหรับนักมวยไทย:
- ดื่มน้ำ 8-10 แก้วต่อวัน
- ดื่มน้ำก่อน ระหว่าง และหลังการฝึก
- หลีกเลี่ยงเครื่องดื่มที่มีน้ำตาลสูง

อาหารที่ควรหลีกเลี่ยง
- อาหารทอดและอาหารมัน
- เครื่องดื่มแอลกอฮอล์
- อาหารที่มีน้ำตาลสูง
- อาหารแปรรูป

การรับประทานอาหารก่อนและหลังการฝึก
- ก่อนการฝึก: รับประทานอาหารเบาๆ 2-3 ชั่วโมงก่อน
- หลังการฝึก: รับประทานอาหารที่มีโปรตีนและคาร์โบไฮเดรตภายใน 30 นาที

โภชนาการที่ดีจะช่วยให้การฝึกมวยไทยมีประสิทธิภาพและร่างกายแข็งแรง`,
    author: "นักโภชนาการ ดร.สุดา",
    date: "2024-12-15",
    category: "โภชนาการ",
    tags: ["อาหาร", "โภชนาการ", "สุขภาพ"],
  },
];

