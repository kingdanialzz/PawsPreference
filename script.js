// Main JavaScript file: script.js

// Initialize DOM elements
const cardStack = document.getElementById("card-stack");
const currentCount = document.getElementById("current-count");
const totalCount = document.getElementById("total-count");
const summarySection = document.getElementById("summary-section");
const swipeSection = document.getElementById("swipe-section");
const likedGallery = document.getElementById("liked-gallery");
const summaryTitle = document.getElementById("summary-title");
const summaryText = document.getElementById("summary-text");
const restartBtn = document.getElementById("restart-btn");

const TOTAL_CATS = 10;

let cats = [];
let currentIndex = 0;
let likedCats = [];

// Sound effects and background music
const likeSound = new Audio("sound/cute_cat.mp3");
const nopeSound = new Audio("sound/angry_cat.mp3");
const bgMusic = new Audio("sound/cute_background.mp3");
bgMusic.loop = true;       
bgMusic.volume = 0.1;      
likeSound.volume = 0.6;
nopeSound.volume = 0.6;

let musicStarted = false;

totalCount.textContent = TOTAL_CATS;

function startBackgroundMusic() {
  if (!musicStarted) {
    bgMusic.play().catch(() => {});
    musicStarted = true;
  }
}

function fetchCats() {
  cats = [];

  for (let i = 0; i < TOTAL_CATS; i++) {
    const imageUrl = `https://cataas.com/cat?width=400&height=500&random=${i}`;
    cats.push(imageUrl);
  }

  renderCards();
}

function renderCards() {
  cardStack.innerHTML = "";

  cats.forEach((catUrl, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.backgroundImage = `url(${catUrl})`;
    card.style.zIndex = cats.length - index;

    if (index === 0) {
      addSwipeFunctionality(card);
    }

    cardStack.appendChild(card);
  });

  currentCount.textContent = 1;
}

function addSwipeFunctionality(card) {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;

  // Create or get overlay indicators on the card
  let indicators = card.querySelector(".swipe-indicators");
  if (!indicators) {
    indicators = document.createElement("div");
    indicators.classList.add("swipe-indicators");
    const likeSpan = document.createElement("span");
    likeSpan.classList.add("dislike");
    likeSpan.textContent = "NOPE";
    const dislikeSpan = document.createElement("span");
    dislikeSpan.classList.add("like");
    dislikeSpan.textContent = "LIKE";
    indicators.appendChild(likeSpan);
    indicators.appendChild(dislikeSpan);
    card.appendChild(indicators);
  }
  const likeIndicator = indicators.querySelector(".like");
  const dislikeIndicator = indicators.querySelector(".dislike");

  // TOUCH EVENTS
  card.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  });

  card.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX - startX;
    currentY = e.touches[0].clientY - startY;
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.05}deg)`;

    // Update overlay indicators opacity and scale
    const opacity = Math.min(Math.abs(currentX) / 100, 1);
    if (currentX > 0) {
      likeIndicator.style.opacity = opacity;
      likeIndicator.style.transform = `scale(${opacity})`;
      dislikeIndicator.style.opacity = 0;
      dislikeIndicator.style.transform = "scale(0.5)";
    } else if (currentX < 0) {
      dislikeIndicator.style.opacity = opacity;
      dislikeIndicator.style.transform = `scale(${opacity})`;
      likeIndicator.style.opacity = 0;
      likeIndicator.style.transform = "scale(0.5)";
    } else {
      likeIndicator.style.opacity = 0;
      likeIndicator.style.transform = "scale(0.5)";
      dislikeIndicator.style.opacity = 0;
      dislikeIndicator.style.transform = "scale(0.5)";
    }
  });

  card.addEventListener("touchend", () => {
    startBackgroundMusic();
    isDragging = false;
    // Reset overlays on release if card is not swiped away
    likeIndicator.style.opacity = 0;
    likeIndicator.style.transform = "scale(0.5)";
    dislikeIndicator.style.opacity = 0;
    dislikeIndicator.style.transform = "scale(0.5)";
    handleCardRelease(card, currentX);
  });

  // MOUSE EVENTS * FOR DESKTOP * 
  card.addEventListener("mousedown", (e) => {
    startBackgroundMusic();
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;

    function onMouseMove(eMove) {
      if (!isDragging) return;
      currentX = eMove.clientX - startX;
      currentY = eMove.clientY - startY;
      card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.05}deg)`;

      // Update overlay indicators opacity and scale
      const opacity = Math.min(Math.abs(currentX) / 100, 1);
      if (currentX > 0) {
        likeIndicator.style.opacity = opacity;
        likeIndicator.style.transform = `scale(${opacity})`;
        dislikeIndicator.style.opacity = 0;
        dislikeIndicator.style.transform = "scale(0.5)";
      } else if (currentX < 0) {
        dislikeIndicator.style.opacity = opacity;
        dislikeIndicator.style.transform = `scale(${opacity})`;
        likeIndicator.style.opacity = 0;
        likeIndicator.style.transform = "scale(0.5)";
      } else {
        likeIndicator.style.opacity = 0;
        likeIndicator.style.transform = "scale(0.5)";
        dislikeIndicator.style.opacity = 0;
        dislikeIndicator.style.transform = "scale(0.5)";
      }
    }

    function onMouseUp() {
      isDragging = false;
      // Reset overlays on release if card is not swiped away
      likeIndicator.style.opacity = 0;
      likeIndicator.style.transform = "scale(0.5)";
      dislikeIndicator.style.opacity = 0;
      dislikeIndicator.style.transform = "scale(0.5)";
      handleCardRelease(card, currentX);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

function handleCardRelease(card, distanceX) {
  const threshold = 80;

  if (distanceX > threshold) {
    likedCats.push(cats[currentIndex]);

    likeSound.currentTime = 0; 
    likeSound.play();

    card.style.transition = "transform 0.5s ease";
    card.style.transform = `translate(${window.innerWidth}px, 0px) rotate(20deg)`;
  } else if (distanceX < -threshold) {

    nopeSound.currentTime = 0;
    nopeSound.play();

    card.style.transition = "transform 0.5s ease";
    card.style.transform = `translate(-${window.innerWidth}px, 0px) rotate(-20deg)`;
  } else {
    card.style.transition = "transform 0.3s ease";
    card.style.transform = "translate(0px, 0px) rotate(0deg)";
    return;
  }

  setTimeout(() => {
    card.remove();
    currentIndex++;
    if (currentIndex >= cats.length) {
      showSummary();
    } else {
      currentCount.textContent = currentIndex + 1;

      // Add swipe to next top card
      const nextCard = document.querySelector(".card");
      if (nextCard) addSwipeFunctionality(nextCard);
    }
  }, 500);
}

// Show summary of liked cats

function showSummary() {
  swipeSection.classList.add("hidden");
  summarySection.classList.remove("hidden");

  summaryText.textContent = `You liked ${likedCats.length} out of ${TOTAL_CATS} cats!`;

  // Summary result TITLE
  summaryTitle.style.fontFamily = "fantasy";
  summaryTitle.style.position = "sticky";
  summaryTitle.style.top = "0";
  summaryTitle.style.background = "transparent";
  summaryTitle.style.zIndex = "20";
  summaryTitle.style.padding = "15px 0";
  summaryTitle.style.color = "#ffffff";
  summaryTitle.style.mixBlendMode = "difference";

  // Summary result TEXT
  summaryText.style.position = "sticky";
  summaryText.style.top = summaryTitle.offsetHeight + "px";
  summaryText.style.background = "transparent";
  summaryText.style.zIndex = "15";
  summaryText.style.padding = "5px 0";
  summaryText.style.color = "#ffffff";
  summaryText.style.mixBlendMode = "difference";

  likedCats.forEach((catUrl) => {
    const img = document.createElement("img");
    img.src = catUrl;
    likedGallery.appendChild(img);
  });

  // Make gallery expand naturally
  likedGallery.style.position = "relative";

  const images = likedGallery.querySelectorAll("img");

  let imagesPerRow;

  if (window.innerWidth <= 480) {
    imagesPerRow = 2; // Mobile usage
  } else if (window.innerWidth <= 768) {
    imagesPerRow = 2; // Tablet usage
  } else {
    imagesPerRow = 3; // Desktop usage
  }

  const gap = 50;
  const sectionHeight = 260;

  images.forEach((img, index) => {
    const imgWidth = Math.min(220, window.innerWidth * 0.45);
    const imgHeight = imgWidth * 0.75;

    img.style.width = imgWidth + "px";
    img.style.height = imgHeight + "px";
    img.style.position = "absolute";

    const row = Math.floor(index / imagesPerRow);
    const positionInRow = index % imagesPerRow;

    // Check how many images are actually in this row
    const remainingImages = images.length - row * imagesPerRow;
    const itemsInThisRow = Math.min(imagesPerRow, remainingImages);

    // Calculate row width dynamically
    const totalRowWidth =
      itemsInThisRow * imgWidth + (itemsInThisRow - 1) * gap;

    const containerWidth = likedGallery.clientWidth;
    const startX = (containerWidth - totalRowWidth) / 2;

    const offsetX = startX + positionInRow * (imgWidth + gap);
    const offsetY = row * sectionHeight + 20;

    img.style.left = offsetX + "px";
    img.style.top = offsetY + "px";

    const rotations = [-6, 6, -3, 3];
    img.style.transform = `rotate(${rotations[index % rotations.length]}deg)`;
  });

  // Extend container height so it becomes scrollable
  const rows = Math.ceil(images.length / imagesPerRow);
  likedGallery.style.height = rows * sectionHeight + 40 + "px";

  addGalleryHoverEffect();

}

restartBtn.addEventListener("click", () => {
  summarySection.classList.add("hidden");
  swipeSection.classList.remove("hidden");
  currentIndex = 0;
  likedCats = [];
  cardStack.innerHTML = "";
  likedGallery.innerHTML = "";
  fetchCats();
});

fetchCats();

function addGalleryHoverEffect() {
  const galleryImages = document.querySelectorAll(".gallery img");

  galleryImages.forEach((img) => {

    img.addEventListener("mousemove", (e) => {
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      img.style.transform = `
        perspective(600px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.08)
      `;
    });

    img.addEventListener("mouseleave", () => {
      img.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
  });
}

function generateBackgroundCats() {
  const bg = document.querySelector(".cat-background");

  const catEmojis = ["🐱", "😺", "😸", "🐾"];

  for (let i = 0; i < 30; i++) {
    const span = document.createElement("span");
    span.textContent = catEmojis[Math.floor(Math.random() * catEmojis.length)];

    span.style.left = Math.random() * 100 + "vw";
    span.style.animationDuration = 8 + Math.random() * 10 + "s";
    span.style.fontSize = 30 + Math.random() * 40 + "px";

    bg.appendChild(span);
  }
}

generateBackgroundCats();