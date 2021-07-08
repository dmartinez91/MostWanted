"use strict"


//Menu functions.
//Used for the overall flow of the application.
/////////////////////////////////////////////////////////////////
//#region 

// app is the function called to start the entire application
function app(people){
  let searchType = promptFor("Do you know the name of the person you are looking for? Enter 'yes' or 'no'", yesNo).toLowerCase();
  let searchResults;
  switch(searchType){
    case 'yes':
      searchResults = searchByName(people);
      break;
    case 'no':
      // TODO: search by traits
      break;
      default:
    app(people); // restart app
      break;
  }
  
  // Call the mainMenu function ONLY after you find the SINGLE person you are looking for
  mainMenu(searchResults, people);
}

// Menu function to call once you find who you are looking for
function mainMenu(person, people){

  /* Here we pass in the entire person object that we found in our search, as well as the entire original dataset of people. We need people in order to find descendants and other information that the user may want. */

  if(!person){
    alert("Could not find that individual.");
    return app(people); // restart
  }

  let displayOption = promptFor("Found " + person.firstName + " " + person.lastName + " . Do you want to know their 'info', 'family', or 'descendants'? Type the option you want or 'restart' or 'quit'", autoValid);

  switch(displayOption){
    case "info":
    // TODO: get person's info
    break;
    case "family":
    // TODO: get person's family
    break;
    case "descendants":
    // TODO: get person's descendants
    break;
    case "restart":
    app(people); // restart
    break;
    case "quit":
    return; // stop execution
    default:
    return mainMenu(person, people); // ask again
  }
}

//#endregion

//Filter functions.
//Ideally you will have a function for each trait.
/////////////////////////////////////////////////////////////////
//#region 

//nearly finished function used to search through an array of people to find matching first and last name and return a SINGLE person object.
function searchByName(people){
  let firstName = promptFor("What is the person's first name?", autoValid);
  let lastName = promptFor("What is the person's last name?", autoValid);

  let foundPerson = people.filter(function(potentialMatch){
    if(potentialMatch.firstName === firstName && potentialMatch.lastName === lastName){
      return true;
    }
    else{
      return false;
    }
  })
  // TODO: find the person single person object using the name they entered.
  return foundPerson;
}

//unfinished function to search through an array of people to find matching eye colors. Use searchByName as reference.


//TODO: add other trait filter functions here.

// Top priority searches
/////////////////////////////////////////////////////////////////


function searchBy(field, people) {
  let userInput = promptFor(`What ${field} would you like to search for?`, autoValid);
  let fieldMatches = people.filter(function (el, field) {

    switch(field){
      case 'gender': return el.gender === userInput;
      case 'height': return el.height === userInput;
      case 'weight': return el.weight === userInput;
      case 'eye color': return el.eyeColor === userInput;
    }
     
  })

  return fieldMatches;
}

function searchMultiple(fields, people) {
  let currentMatches;

  // 5 is limitting search criteria to no more than 5
  for (let i = 0; i < 5; i++) {
    const field = fields[i];
    currentMatches = searchBy(field, people);
  }

  return currentMatches;
}



// Secondary priority searches
//////////////////////////////////////////////////////////////////

// by first name

// by last name

// by DOB

// by occupation


//#endregion

//Display functions.
//Functions for user interface.
/////////////////////////////////////////////////////////////////
//#region 

// alerts a list of people
function displayPeople(people){
  alert(people.map(function(person){
    return person.firstName + " " + person.lastName;
  }).join("\n"));
}

function displayPerson(person){
  let personInfo = "";

  for (const property in person) {
    if (property === "id" ||
        property === "parents" ||
        property === "currentSpouse"){
      continue;
    }
    personInfo += `${property}: ${person[property]}\n`;
  }
  
  alert(personInfo);
}

function displayFamily(people, person) {
  let immediateFamily = findFamily(person, people);

  //for 
  let output = "";
  for (const property in immediateFamily){
    for (let i = 0; i < immediateFamily[property].length; i++) {
      const relative = immediateFamily[property][i];
      output += `${property}: ${relative.firstName} ${relative.lastName}\n`
    }
  }
  alert(output);
}

function findFamily(person, people) {
  // Person => "parents", "currentSpouse"
  let parentIds = person.parents;
  let currentSpouseId = person.currentSpouse;

  // Find each person by id
  
  // Only 0 or 1 currentspouse
  let currentSpouse = findById(currentSpouseId, people);

  // 0, 1, or 2 parents
  let parents = [];
  let siblings = [];
  for (let index = 0; index < parentIds.length; index++) {
    const parentId = parentIds[index];
    let currentParent = findById(parentId, people)[0];
    let currentSiblings = findByParent(parentId, people);

    
    for (let k = 0; k < currentSiblings.length; k++) {
      if(currentSiblings[k].id === person.id){
        continue; 
      }  
      siblings.push(currentSiblings[k]);
    }
    parents.push(currentParent);
  }



  // Find children
  let children = findByParent(person.id, people);

  let family = {
    "parents": parents,
    "currentSpouse": currentSpouse,
    "children": children,
    "siblings": siblings
  };

  return family;

  
}

function findById(id, people) {
  let person = people.filter(function(el){
    return (el.id === id);
  })
  return person;
}

function findByParent(parentId, people) {
  let kids = people.filter(function(el){
    // person's parents include the parentId
    for (let i = 0; i < el.parents.length; i++) {
      if (el.parents[i] === parentId) {
        return true;
      }
    }
    return false;
  })
  return kids;
}






//#endregion



//Validation functions.
//Functions to validate user input.
/////////////////////////////////////////////////////////////////
//#region 

//a function that takes in a question to prompt, and a callback function to validate the user input.
//response: Will capture the user input.
//isValid: Will capture the return of the validation function callback. true(the user input is valid)/false(the user input was not valid).
//this function will continue to loop until the user enters something that is not an empty string("") or is considered valid based off the callback function(valid).
function promptFor(question, valid){
  let response;
  let isValid;
  do{
    response = prompt(question).trim();
    isValid = valid(response);
  } while(response !== ""  ||  isValid === false)
  return response
}

// helper function/callback to pass into promptFor to validate yes/no answers.
function yesNo(input){
  if(input.toLowerCase() == "yes" || input.toLowerCase() == "no"){
    return true;
  }
  else{
    return false;
  }
}

// helper function to pass in as default promptFor validation.
//this will always return true for all inputs.
function autoValid(input){
  return true; // default validation only
}

//Unfinished validation function you can use for any of your custom validation callbacks.
//can be used for things like eye color validation for example.
function customValidation(input){
  
}

//#endregion