
let app_id="835abe5b"
let app_key="324162b9baaf575256e1bbef92a86ebb"
let recipe_container=document.querySelector(".recipe-container")
let form=document.querySelector(".Container")
let recipe_list=[]
let food_type;
form.addEventListener("submit",(e)=>{
  e.preventDefault()
  let fooditem=document.querySelector(".fooditem")
  if(fooditem.value==""){
    alert("Please enter a food item")
  }
  else{
    food_type=fooditem.value
    recipeResponse()
  }
})
async function recipeResponse(){
    fetch(`https://api.edamam.com/api/recipes/v2?type=public&app_id=835abe5b&app_key=324162b9baaf575256e1bbef92a86ebb&q=${food_type}`)
    .then((res)=>res.json())
    .then((data)=>{
        // console.log(data)
        recipe_container.innerHTML=""
        for(id in data.hits){
            // console.log(data.hits[id].recipe.label)
            // console.log(data.hits[id].recipe)
            recipe_list.push(data.hits[id].recipe)
          let elem=
          `
          <div class="col-md-6 col-lg-4 col-sm-6 ">
          <div id="${id}" class="recipe">
            <img src="${data.hits[id].recipe.image}" alt="food img">
            <div class="context-info">
              <h2>${data.hits[id].recipe.label}</h2>
             <button onclick="showrecipe(this)"><a>View Recipe <i class="fa fa-external-link" aria-hidden="true"></i></a></button>
            </div>
          </div>
        </div>
          `
          recipe_container.innerHTML+=elem
      }
      // console.log(recipe_list)
      // console.log(recipe_list.length)

    })
    
    
  }
  



// -----------------------------------------recipe.html----------------------------------------------
let recipe_ingredients_container=document.querySelector(".ingredient-container ")
let procedure_container=document.querySelector(".procedure-container")

function showprocedure(ingredientlist,procedurelist){
  recipe_ingredients_container.innerHTML=""
    for(item of ingredientlist){
      // console.log(item)
      let elem=
      `
      <div class="col-md-6 col-lg-4 col-sm-6 ">
          <div class="ingredient">
            <img src="${item.image}" alt="food img">
            <div class="ingredient-info">
              <h4>${item.food}</h4>
              <p>${item.text}</p>
            </div>
          </div>
        </div>
      
      `
      recipe_ingredients_container.innerHTML+=elem
    }
    let step=1
    procedure_container.innerHTML=""
    for(steps of procedurelist){
      let elem=
      `
      <P><span class="indicator">step ${step}</span>: ${steps}</P>
      `
      step+=1
      procedure_container.innerHTML+=elem
    }
    document.querySelector("#ingredient-container").scrollIntoView({behavior:'smooth'})
}



function showrecipe(clickedrecipe){
  let recipe_id=clickedrecipe.parentElement.parentElement.id
  // console.log(recipe_list[recipe_id].ingredientLines)
  // console.log(recipe_list[recipe_id].ingredients)
  // console.log(recipe_list[recipe_id].ingredients[0])
  showprocedure(recipe_list[recipe_id].ingredients,recipe_list[recipe_id].ingredientLines)
}


