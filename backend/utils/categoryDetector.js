// Category detection based on merchant/description keywords
const categoryKeywords = {
  Food: [
    "restaurant",
    "cafe",
    "pizza",
    "burger",
    "food",
    "grocery",
    "supermarket",
    "swiggy",
    "zomato",
    "uber eats",
    "dominos",
    "mcdonalds",
    "starbucks",
    "coffee",
  ],
  Transport: [
    "uber",
    "ola",
    "lyft",
    "taxi",
    "metro",
    "bus",
    "train",
    "petrol",
    "gas",
    "fuel",
    "parking",
    "toll",
  ],
  Shopping: [
    "amazon",
    "flipkart",
    "myntra",
    "mall",
    "store",
    "shop",
    "retail",
    "clothing",
    "electronics",
  ],
  Bills: [
    "electricity",
    "water",
    "internet",
    "phone",
    "mobile",
    "recharge",
    "utility",
    "rent",
    "insurance",
  ],
  Entertainment: [
    "netflix",
    "spotify",
    "movie",
    "cinema",
    "theatre",
    "concert",
    "game",
    "gaming",
    "subscription",
  ],
  Health: [
    "hospital",
    "pharmacy",
    "medicine",
    "doctor",
    "clinic",
    "gym",
    "fitness",
    "medical",
  ],
  Education: [
    "course",
    "book",
    "udemy",
    "coursera",
    "school",
    "college",
    "tuition",
    "education",
  ],
};

const detectCategory = (merchant, description = "") => {
  const text = `${merchant} ${description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return "Other";
};

module.exports = { detectCategory };
