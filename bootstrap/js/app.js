// API Configuration
const app_id = "835abe5b";
const app_key = "324162b9baaf575256e1bbef92a86ebb";

// DOM Elements
let recipe_container = document.querySelector(".recipe-container");
let ingredient_container = document.querySelector(".ingredient-container");
let procedure_container = document.querySelector(".procedure-container");
let form = document.querySelector(".Container");
let loadingScreen = document.getElementById("loading-screen");
let fab = document.querySelector(".fab");
let toastContainer = document.getElementById("toast-container");

// Data Storage
let recipe_list = [];
let food_type;
let currentView = 'grid';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setTimeout(hideLoadingScreen, 2000);
});

// App Initialization
function initializeApp() {
    // Hide content sections initially
    hideAllSections();
    
    // Setup smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Focus on search input
    setTimeout(() => {
        document.querySelector('.fooditem').focus();
    }, 2500);
}

function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transform = 'scale(0.9)';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 300);
}

function hideAllSections() {
    document.getElementById('recipes-section').style.display = 'none';
    document.getElementById('ingredients-section').style.display = 'none';
    document.getElementById('procedure-section').style.display = 'none';
}

// Event Listeners Setup
function setupEventListeners() {
    // Form submission
    form.addEventListener("submit", handleFormSubmit);
    
    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', toggleView);
    });
    
    // Scroll to top FAB
    fab.addEventListener('click', scrollToTop);
    
    // Scroll detection for FAB
    window.addEventListener('scroll', handleScroll);
    
    // Search input enhancements
    const searchInput = document.querySelector('.fooditem');
    searchInput.addEventListener('keyup', handleSearchInput);
    
    // Recipe action buttons
    setupRecipeActions();
}

function handleFormSubmit(e) {
    e.preventDefault();
    const fooditem = document.querySelector(".fooditem");
    
    if (fooditem.value.trim() === "") {
        showToast("Please enter a food item", "error");
        fooditem.focus();
        return;
    }
    
    food_type = fooditem.value.trim();
    showLoadingState();
    recipeResponse();
}

function handleSearchInput(e) {
    // Add search suggestions or validation here
    const value = e.target.value;
    if (value.length > 2) {
        // Could add autocomplete functionality here
    }
}

function toggleView(e) {
    const viewType = e.target.closest('.view-btn').dataset.view;
    currentView = viewType;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.closest('.view-btn').classList.add('active');
    
    // Apply view class
    recipe_container.className = recipe_container.className.replace(/\s*(list-view|grid-view)/g, '');
    recipe_container.classList.add(`${viewType}-view`);
    
    showToast(`Switched to ${viewType} view`, "success");
}

function handleScroll() {
    if (window.scrollY > 300) {
        fab.classList.add('show');
    } else {
        fab.classList.remove('show');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToRecipes() {
    document.getElementById('recipes-section').scrollIntoView({
        behavior: 'smooth'
    });
}

// API Functions
async function recipeResponse() {
    try {
        showToast("Searching for delicious recipes...", "info");
        
        const response = await fetch(`https://api.edamam.com/api/recipes/v2?type=public&app_id=${app_id}&app_key=${app_key}&q=${food_type}&random=true`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.hits || data.hits.length === 0) {
            showNoResults();
            return;
        }
        
        recipe_list = data.hits.map(hit => hit.recipe);
        displayRecipes(data.hits);
        updateResultsCount(data.hits.length);
        showSection('recipes-section');
        
        showToast(`Found ${data.hits.length} amazing recipes!`, "success");
        
        // Smooth scroll to results
        setTimeout(() => {
            document.getElementById('recipes-section').scrollIntoView({
                behavior: 'smooth'
            });
        }, 300);
        
    } catch (error) {
        console.error('Error fetching recipes:', error);
        showToast("Oops! Something went wrong. Please try again.", "error");
        hideLoadingState();
    }
}

function displayRecipes(hits) {
    recipe_container.innerHTML = "";
    
    hits.forEach((hit, index) => {
        const recipe = hit.recipe;
        const recipeCard = createRecipeCard(recipe, index);
        recipe_container.appendChild(recipeCard);
    });
    
    hideLoadingState();
    
    // Add stagger animation
    animateRecipeCards();
}

function createRecipeCard(recipe, index) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-sm-6 mb-4';
    
    const calories = Math.round(recipe.calories);
    const cookTime = recipe.totalTime > 0 ? `${recipe.totalTime} min` : 'Quick';
    const servings = recipe.yield || 'N/A';
    
    col.innerHTML = `
        <div id="${index}" class="recipe">
            <div class="recipe-image-container" style="position: relative;">
                <img src="${recipe.image}" alt="${recipe.label}" loading="lazy">
                <div class="recipe-overlay" style="position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 5px;">
                    <span class="badge" style="background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                        <i class="fas fa-fire"></i> ${calories} cal
                    </span>
                    <span class="badge" style="background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                        <i class="fas fa-clock"></i> ${cookTime}
                    </span>
                </div>
            </div>
            <div class="context-info">
                <h2>${recipe.label}</h2>
                <div class="recipe-meta" style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #666; font-size: 0.9rem;">
                    <span><i class="fas fa-users"></i> Serves ${servings}</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.cuisineType?.[0] || 'International'}</span>
                </div>
                <div class="recipe-tags" style="margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 5px;">
                    ${recipe.dietLabels?.slice(0, 2).map(label => 
                        `<span style="background: #e3f2fd; color: #1976d2; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem;">${label}</span>`
                    ).join('') || ''}
                </div>
                <button onclick="showrecipe(this)" class="view-recipe-btn">
                    <a>View Recipe <i class="fa fa-external-link" aria-hidden="true"></i></a>
                </button>
            </div>
        </div>
    `;
    
    return col;
}

function animateRecipeCards() {
    const cards = document.querySelectorAll('.recipe');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function showNoResults() {
    recipe_container.innerHTML = `
        <div class="col-12">
            <div class="no-results" style="text-align: center; padding: 3rem; background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3 style="color: #666; margin-bottom: 1rem;">No recipes found</h3>
                <p style="color: #999;">Try searching for something else like "chicken", "pasta", or "salad"</p>
                <button onclick="clearSearch()" style="margin-top: 1rem; padding: 0.8rem 2rem; background: var(--primary-color); color: white; border: none; border-radius: 10px; cursor: pointer;">
                    Try Another Search
                </button>
            </div>
        </div>
    `;
    
    showSection('recipes-section');
    hideLoadingState();
}

function clearSearch() {
    document.querySelector('.fooditem').value = '';
    document.querySelector('.fooditem').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Recipe Details Functions
function showrecipe(clickedRecipe) {
    const recipe_id = clickedRecipe.closest('.recipe').id;
    const recipe = recipe_list[recipe_id];
    
    if (!recipe) {
        showToast("Recipe not found", "error");
        return;
    }
    
    showLoadingState();
    
    setTimeout(() => {
        displayRecipeDetails(recipe);
        hideLoadingState();
    }, 500);
}

function displayRecipeDetails(recipe) {
    showprocedure(recipe.ingredients, recipe.ingredientLines);
    showSection('ingredients-section');
    showSection('procedure-section');
    
    // Update page title
    document.title = `${recipe.label} - Foodie's Book`;
    
    showToast("Recipe loaded successfully!", "success");
}

function showprocedure(ingredientlist, procedurelist) {
    // Display ingredients
    ingredient_container.innerHTML = "";
    
    if (ingredientlist && ingredientlist.length > 0) {
        ingredientlist.forEach(item => {
            const ingredientCard = createIngredientCard(item);
            ingredient_container.appendChild(ingredientCard);
        });
    }
    
    // Display procedure
    procedure_container.innerHTML = "";
    
    if (procedurelist && procedurelist.length > 0) {
        procedurelist.forEach((step, index) => {
            const stepElement = createProcedureStep(step, index + 1);
            procedure_container.appendChild(stepElement);
        });
    } else {
        procedure_container.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <i class="fas fa-external-link-alt" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666;">Detailed cooking instructions are available on the original recipe website.</p>
            </div>
        `;
    }
    
    // Smooth scroll to ingredients
    setTimeout(() => {
        document.querySelector("#ingredient-container").scrollIntoView({
            behavior: 'smooth'
        });
    }, 100);
}

function createIngredientCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 col-sm-6 mb-4';
    
    const imageUrl = item.image || 'https://via.placeholder.com/200x150?text=No+Image';
    
    col.innerHTML = `
        <div class="ingredient">
            <img src="${imageUrl}" alt="${item.food}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
            <div class="ingredient-info">
                <h4>${item.food}</h4>
                <p>${item.text}</p>
                ${item.weight ? `<small style="color: #999;">Weight: ${Math.round(item.weight)}g</small>` : ''}
            </div>
        </div>
    `;
    
    return col;
}

function createProcedureStep(step, stepNumber) {
    const stepElement = document.createElement('p');
    stepElement.innerHTML = `
        <span class="indicator">Step ${stepNumber}</span>
        ${step}
    `;
    
    // Add animation
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'translateX(-30px)';
    
    setTimeout(() => {
        stepElement.style.transition = 'all 0.5s ease-out';
        stepElement.style.opacity = '1';
        stepElement.style.transform = 'translateX(0)';
    }, stepNumber * 200);
    
    return stepElement;
}

// Utility Functions
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.style.display = 'block';
    section.style.opacity = '0';
    
    setTimeout(() => {
        section.style.transition = 'opacity 0.5s ease-out';
        section.style.opacity = '1';
    }, 50);
}

function showLoadingState() {
    const searchBtn = document.querySelector('.searchbtn');
    const originalText = searchBtn.innerHTML;
    
    searchBtn.innerHTML = `
        <span class="btn-text">
            <i class="fas fa-spinner fa-spin"></i> 
            Searching...
        </span>
    `;
    searchBtn.disabled = true;
    
    // Store original text for restoration
    searchBtn.dataset.originalText = originalText;
}

function hideLoadingState() {
    const searchBtn = document.querySelector('.searchbtn');
    
    if (searchBtn.dataset.originalText) {
        searchBtn.innerHTML = searchBtn.dataset.originalText;
    }
    searchBtn.disabled = false;
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    resultsCount.textContent = `${count} recipe${count !== 1 ? 's' : ''} found`;
}

// Quick Search Function
function quickSearch(query) {
    const searchInput = document.querySelector('.fooditem');
    searchInput.value = query;
    
    // Trigger search animation
    searchInput.style.transform = 'scale(1.05)';
    setTimeout(() => {
        searchInput.style.transform = 'scale(1)';
    }, 200);
    
    // Auto-submit after a short delay
    setTimeout(() => {
        form.dispatchEvent(new Event('submit'));
    }, 300);
}

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="${icon}" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Recipe Actions Setup
function setupRecipeActions() {
    // Favorite button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.favorite-btn')) {
            showToast("Recipe saved to favorites!", "success");
        }
    });
    
    // Share button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.share-btn')) {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                showToast("Recipe link copied to clipboard!", "success");
            }
        }
    });
    
    // Print button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.print-btn')) {
            window.print();
        }
    });
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + / to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.querySelector('.fooditem').focus();
    }
    
    // Escape to clear search and scroll to top
    if (e.key === 'Escape') {
        document.querySelector('.fooditem').blur();
        if (document.querySelector('.fooditem').value) {
            clearSearch();
        }
    }
});

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy Loading for Images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showToast("An unexpected error occurred. Please refresh the page.", "error");
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}