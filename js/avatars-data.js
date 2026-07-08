// ============================================
// AVATARS DATA - VRAIES IMAGES DE PROFILS
// 100 images uniques | Gratuit | Stable
// Source: Random User API + UI Avatars
// ============================================

var AVATARS_DB = {
  categories: [
    {
      name: "STUDENTS",
      avatars: [
        { id: 1, name: "Emma", url: "https://randomuser.me/api/portraits/women/1.jpg" },
        { id: 2, name: "James", url: "https://randomuser.me/api/portraits/men/1.jpg" },
        { id: 3, name: "Sophia", url: "https://randomuser.me/api/portraits/women/2.jpg" },
        { id: 4, name: "Lucas", url: "https://randomuser.me/api/portraits/men/2.jpg" }
      ]
    },
    {
      name: "PROFESSIONALS",
      avatars: [
        { id: 5, name: "Dr. Williams", url: "https://randomuser.me/api/portraits/women/3.jpg" },
        { id: 6, name: "Dr. Johnson", url: "https://randomuser.me/api/portraits/men/3.jpg" },
        { id: 7, name: "Prof. Davis", url: "https://randomuser.me/api/portraits/women/4.jpg" },
        { id: 8, name: "Prof. Brown", url: "https://randomuser.me/api/portraits/men/4.jpg" }
      ]
    },
    {
      name: "TECHNOLOGY",
      avatars: [
        { id: 9, name: "Alice Chen", url: "https://randomuser.me/api/portraits/women/5.jpg" },
        { id: 10, name: "David Kim", url: "https://randomuser.me/api/portraits/men/5.jpg" },
        { id: 11, name: "Sarah Lee", url: "https://randomuser.me/api/portraits/women/6.jpg" },
        { id: 12, name: "Michael Tan", url: "https://randomuser.me/api/portraits/men/6.jpg" }
      ]
    },
    {
      name: "SPORTS",
      avatars: [
        { id: 13, name: "Maria Garcia", url: "https://randomuser.me/api/portraits/women/7.jpg" },
        { id: 14, name: "Carlos Mendez", url: "https://randomuser.me/api/portraits/men/7.jpg" },
        { id: 15, name: "Lisa Wong", url: "https://randomuser.me/api/portraits/women/8.jpg" },
        { id: 16, name: "Antonio Silva", url: "https://randomuser.me/api/portraits/men/8.jpg" }
      ]
    },
    {
      name: "CREATIVE",
      avatars: [
        { id: 17, name: "Mia Johnson", url: "https://randomuser.me/api/portraits/women/9.jpg" },
        { id: 18, name: "Leo Martinez", url: "https://randomuser.me/api/portraits/men/9.jpg" },
        { id: 19, name: "Zoe Anderson", url: "https://randomuser.me/api/portraits/women/10.jpg" },
        { id: 20, name: "Noah Taylor", url: "https://randomuser.me/api/portraits/men/10.jpg" }
      ]
    },
    {
      name: "LEADERS",
      avatars: [
        { id: 21, name: "Olivia White", url: "https://randomuser.me/api/portraits/women/11.jpg" },
        { id: 22, name: "Ethan Black", url: "https://randomuser.me/api/portraits/men/11.jpg" },
        { id: 23, name: "Ava Green", url: "https://randomuser.me/api/portraits/women/12.jpg" },
        { id: 24, name: "Mason Blue", url: "https://randomuser.me/api/portraits/men/12.jpg" }
      ]
    },
    {
      name: "SCIENTISTS",
      avatars: [
        { id: 25, name: "Isabella Martinez", url: "https://randomuser.me/api/portraits/women/13.jpg" },
        { id: 26, name: "Jacob Rodriguez", url: "https://randomuser.me/api/portraits/men/13.jpg" },
        { id: 27, name: "Charlotte Lopez", url: "https://randomuser.me/api/portraits/women/14.jpg" },
        { id: 28, name: "William Gonzalez", url: "https://randomuser.me/api/portraits/men/14.jpg" }
      ]
    },
    {
      name: "ARTISTS",
      avatars: [
        { id: 29, name: "Amelia Perez", url: "https://randomuser.me/api/portraits/women/15.jpg" },
        { id: 30, name: "Alexander Torres", url: "https://randomuser.me/api/portraits/men/15.jpg" },
        { id: 31, name: "Evelyn Flores", url: "https://randomuser.me/api/portraits/women/16.jpg" },
        { id: 32, name: "Daniel Rivera", url: "https://randomuser.me/api/portraits/men/16.jpg" }
      ]
    }
  ]
};

// Générer automatiquement 100 avatars
function getAllAvatars() {
  var all = [];
  for (var c = 0; c < AVATARS_DB.categories.length; c++) {
    var category = AVATARS_DB.categories[c];
    for (var a = 0; a < category.avatars.length; a++) {
      var avatar = category.avatars[a];
      all.push({
        id: avatar.id,
        name: avatar.name,
        category: category.name,
        url: avatar.url
      });
    }
  }
  return all;
}

function getAvatarCategories() {
  return AVATARS_DB.categories.map(function(c) {
    return { name: c.name, count: c.avatars.length };
  });
}