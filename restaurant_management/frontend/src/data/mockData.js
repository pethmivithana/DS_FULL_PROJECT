// src/data/mockData.js
export const restaurants = [
    {
      id: 1,
      name: "Burger Palace",
      image: "https://source.unsplash.com/FoyCKrXWQvc/800x800",
      cuisine: "American",
      rating: 4.7,
      deliveryTime: "25-35",
      deliveryFee: "$2.99",
      address: "123 Burger Ave, Foodtown"
    },
    {
      id: 2,
      name: "Pizza Planet",
      image: "https://source.unsplash.com/MQUqbmszGGM/800x800",
      cuisine: "Italian",
      rating: 4.5,
      deliveryTime: "30-45",
      deliveryFee: "$3.49",
      address: "456 Pizza St, Foodtown"
    },
    {
      id: 3,
      name: "Sushi Supreme",
      image: "https://source.unsplash.com/iy_MT2ifklc/800x800",
      cuisine: "Japanese",
      rating: 4.8,
      deliveryTime: "40-55",
      deliveryFee: "$4.99",
      address: "789 Sushi Rd, Foodtown"
    },
    {
      id: 4,
      name: "Taco Town",
      image: "https://source.unsplash.com/IGfIGP5ONV0/800x800",
      cuisine: "Mexican",
      rating: 4.4,
      deliveryTime: "20-35",
      deliveryFee: "$2.49",
      address: "101 Taco Blvd, Foodtown"
    },
    {
      id: 5,
      name: "Thai Delight",
      image: "https://source.unsplash.com/SqYmTDQYMjo/800x800",
      cuisine: "Thai",
      rating: 4.6,
      deliveryTime: "35-50",
      deliveryFee: "$3.99",
      address: "202 Thai Lane, Foodtown"
    },
    {
      id: 6,
      name: "Indian Spice",
      image: "https://source.unsplash.com/EzH46XCDQRY/800x800",
      cuisine: "Indian",
      rating: 4.9,
      deliveryTime: "45-60",
      deliveryFee: "$3.99",
      address: "303 Curry Circle, Foodtown"
    }
  ];
  
  export const menuItems = [
    // Burger Palace Menu Items
    {
      id: 101,
      restaurantId: 1,
      name: "Classic Cheeseburger",
      description: "Beef patty with cheddar cheese, lettuce, tomato, and special sauce",
      price: 9.99,
      image: "https://source.unsplash.com/MbQZU0wX9II/800x600",
      category: "Burgers"
    },
    {
      id: 102,
      restaurantId: 1,
      name: "Double Bacon Burger",
      description: "Two beef patties with crispy bacon, cheddar cheese, and BBQ sauce",
      price: 12.99,
      image: "https://source.unsplash.com/YsGJRbdsrN0/800x600",
      category: "Burgers"
    },
    {
      id: 103,
      restaurantId: 1,
      name: "Veggie Burger",
      description: "Plant-based patty with lettuce, tomato, pickles, and vegan mayo",
      price: 10.99,
      image: "https://source.unsplash.com/IGfIGP5ONV0/800x600",
      category: "Vegetarian"
    },
    {
      id: 104,
      restaurantId: 1,
      name: "French Fries",
      description: "Crispy golden fries with sea salt",
      price: 3.99,
      image: "https://source.unsplash.com/vi0kZuoe0-8/800x600",
      category: "Sides"
    },
    {
      id: 105,
      restaurantId: 1,
      name: "Onion Rings",
      description: "Beer-battered onion rings with chipotle dipping sauce",
      price: 4.99,
      image: "https://source.unsplash.com/_Yp_DQI8H0k/800x600",
      category: "Sides"
    },
    {
      id: 106,
      restaurantId: 1,
      name: "Chocolate Milkshake",
      description: "Rich and creamy chocolate milkshake topped with whipped cream",
      price: 5.99,
      image: "https://source.unsplash.com/bF9JYwN4BvQ/800x600",
      category: "Drinks"
    },
    
    // Pizza Planet Menu Items
    {
      id: 201,
      restaurantId: 2,
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomato sauce, and basil on a thin crust",
      price: 14.99,
      image: "https://source.unsplash.com/x00CzBt4Dfk/800x600",
      category: "Pizzas"
    },
    {
      id: 202,
      restaurantId: 2,
      name: "Pepperoni Pizza",
      description: "Classic pepperoni with mozzarella and tomato sauce",
      price: 16.99,
      image: "https://source.unsplash.com/MQUqbmszGGM/800x600",
      category: "Pizzas"
    },
    {
      id: 203,
      restaurantId: 2,
      name: "Veggie Supreme",
      description: "Bell peppers, onions, mushrooms, olives, and tomatoes",
      price: 17.99,
      image: "https://source.unsplash.com/Oxb84ENcFfU/800x600",
      category: "Vegetarian"
    },
    {
      id: 204,
      restaurantId: 2,
      name: "Garlic Knots",
      description: "Twisted pizza dough knots with garlic butter and parmesan",
      price: 6.99,
      image: "https://source.unsplash.com/b4Xk6bzb-GQ/800x600",
      category: "Sides"
    },
    {
      id: 205,
      restaurantId: 2,
      name: "Caesar Salad",
      description: "Romaine lettuce, croutons, parmesan, and Caesar dressing",
      price: 7.99,
      image: "https://source.unsplash.com/IGfIGP5ONV0/800x600",
      category: "Salads"
    },
    {
      id: 206,
      restaurantId: 2,
      name: "Italian Soda",
      description: "Sparkling water with your choice of flavored syrup",
      price: 3.99,
      image: "https://source.unsplash.com/PDRFeeDniCk/800x600",
      category: "Drinks"
    },
    
    // Sushi Supreme Menu Items
    {
      id: 301,
      restaurantId: 3,
      name: "California Roll",
      description: "Crab, avocado, cucumber, and tobiko",
      price: 8.99,
      image: "https://source.unsplash.com/iy_MT2ifklc/800x600",
      category: "Rolls"
    },
    {
      id: 302,
      restaurantId: 3,
      name: "Spicy Tuna Roll",
      description: "Spicy tuna, cucumber, and green onion",
      price: 10.99,
      image: "https://source.unsplash.com/ONe-snbYYpU/800x600",
      category: "Rolls"
    },
    {
      id: 303,
      restaurantId: 3,
      name: "Salmon Nigiri",
      description: "Fresh salmon over seasoned rice",
      price: 6.99,
      image: "https://source.unsplash.com/5Z9-u-Q_FBM/800x600",
      category: "Nigiri"
    },
    {
      id: 304,
      restaurantId: 3,
      name: "Miso Soup",
      description: "Traditional Japanese soup with tofu and seaweed",
      price: 3.99,
      image: "https://source.unsplash.com/IGfIGP5ONV0/800x600",
      category: "Appetizers"
    },
    {
      id: 305,
      restaurantId: 3,
      name: "Seaweed Salad",
      description: "Marinated seaweed with sesame seeds",
      price: 5.99,
      image: "https://source.unsplash.com/IGfIGP5ONV0/800x600",
      category: "Salads"
    },
    {
      id: 306,
      restaurantId: 3,
      name: "Green Tea",
      description: "Traditional Japanese green tea",
      price: 2.99,
      image: "https://source.unsplash.com/qBrF1yu5Wys/800x600",
      category: "Drinks"
    }
  ];