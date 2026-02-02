import User from "../models/user.model.js";

export const checkBadges = async (userId, actionType) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let pointsToAdd = 0;
    const newBadges = [];

    // 1. Adăugăm puncte în funcție de acțiune
    if (actionType === "post") {
      user.stats.totalPosts += 1;
      pointsToAdd = 10; // 10 puncte pentru o postare
    } else if (actionType === "comment") {
      user.stats.totalComments += 1;
      pointsToAdd = 5; // 5 puncte pentru un comentariu
    } else if (actionType === "like_received") {
      user.stats.totalLikesReceived += 1;
      pointsToAdd = 2; // 2 puncte dacă cineva îți dă like
    }

    user.gamification.points += pointsToAdd;

    // 2. Verificăm Badge-uri (Reguli)

    // Badge: "Primul Pas" (Prima Postare)
    if (user.stats.totalPosts === 1 && !hasBadge(user, "Primul Pas")) {
      newBadges.push({ name: "Primul Pas", icon: "🌱" });
    }

    // Badge: "Fashionista" (10 Postări)
    if (user.stats.totalPosts === 10 && !hasBadge(user, "Fashionista")) {
      newBadges.push({ name: "Fashionista", icon: "👗" });
    }

    // Badge: "Voce Activă" (5 Comentarii)
    if (user.stats.totalComments === 5 && !hasBadge(user, "Voce Activă")) {
      newBadges.push({ name: "Voce Activă", icon: "🗣️" });
    }

    // Badge: "Influencer" (50 Like-uri primite)
    if (user.stats.totalLikesReceived >= 50 && !hasBadge(user, "Influencer")) {
      newBadges.push({ name: "Influencer", icon: "⭐" });
    }

    // Badge Special pentru Magazine: "Organizator Concursuri"
    // Această verificare se poate face separat în controller
    
    // 3. Salvăm modificările
    if (newBadges.length > 0) {
      user.gamification.badges.push(...newBadges);
    }

    // Calculăm nivelul (ex: 100 puncte per nivel)
    user.gamification.level = Math.floor(user.gamification.points / 100) + 1;

    await user.save();
    return newBadges; // Returnăm badge-urile noi pentru a notifica userul (opțional)

  } catch (err) {
    console.error("Eroare gamification:", err);
  }
};

const hasBadge = (user, badgeName) => {
  return user.gamification.badges.some((b) => b.name === badgeName);
};