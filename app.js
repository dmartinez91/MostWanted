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
      searchResults = searchMenu(people);
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

  if (person.length === 1) {
    person = person[0];
  } else {
    person = displayPeople(person);
  }
  
  /* Here we pass in the entire person object that we found in our search, as well as the entire original dataset of people. We need people in order to find descendants and other information that the user may want. */

  if(!person){
    alert("Could not find that individual.");
    return app(people); // restart
  }

  let displayOption = promptFor("Found " + person.firstName + " " + person.lastName + " . Do you want to know their 'info', 'family', or 'descendants'? Type the option you want or 'restart' or 'quit'", autoValid);

  switch(displayOption){
    case "info":
      displayPerson(person)
      break;
    case "family":
      displayFamily(people, person)
      break;
    case "descendants":
      displayDescendants(person, people)
      break;
    case "restart":
      app(people); // restart
      break;
    case "quit":
      return; // stop execution
    default:
      return mainMenu(person, people); // ask again
  }
  mainMenu([person], people);
}



function searchMenu(people){
  let userSearch = ''
  let fields = [];
  
  // 5 is limitting search criteria to no more than 5
  while(userSearch != 'done' && fields.length < 5){
    userSearch = promptFor('Which trait(s) would you like to search, type DONE when you are finished', autoValid).toLowerCase()
    if (userSearch != 'done'){
      fields.push(userSearch) 
    }
  }
  return searchMultiple(fields, people)
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
    if(potentialMatch.firstName.toLowerCase() === firstName.toLowerCase() && potentialMatch.lastName.toLowerCase() === lastName.toLowerCase()){
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
  let fieldMatches = people.filter(function (el) {


    let whatever = false;
    switch(field){
      case 'gender': whatever = (el.gender == userInput);
      break;
      case 'height': whatever = (el.height == userInput);
      break;
      case 'weight': whatever = (el.weight == userInput);
      break;
      case 'eye color': whatever =  (el.eyeColor == userInput);
      break;
    }
    return whatever;

     
  })

  return fieldMatches;
}

function searchMultiple(fields, people) {
  let currentMatches = people;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    currentMatches = searchBy(field, currentMatches);
  }

  return currentMatches;
}

function findDescendants(person, people) {
  // only grandparent = Joy Madden, index 8
  let parentId = person.id;
  let children = people.filter(function (el) {
    for (let i = 0; i < el.parents.length; i++) {
      return (el.parents[i] === parentId);
    }
  })

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.children = findDescendants(child, people);
  }

  return children;
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

  let output = "Found the following people: \n";
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    output += `${i + 1}: ${person.firstName} ${person.lastName}\n`
  }

  output += `\n\nWhich person would you like to select?`;

  let userInput = promptFor(output, autoValid);
  let selectedPerson = people[userInput - 1];

  return selectedPerson;

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

function displayDescendants(person, people) {
  // Person: all their data, including a children field
  // Each child will have a children field (ad nauseum)

  // TODO: make recursive, to allow for multiple levels of grandchildren (i.e. great grandchildren, etc.)

  person.children = findDescendants(person, people);

  let output = "";
  if (person.children.length === 0) {
    output = "This person has no descendants.";
  }
  else {
    for (let i = 0; i < person.children.length; i++) {
      const child = person.children[i];
      output += `Child: ${child.firstName} ${child.lastName}\n`;

      for (let j = 0; j < child.children.length; j++){
        let grandchild = child.children[j];
        output += `Grandchild: ${grandchild.firstName} ${grandchild.lastName}\n`;
      }
    }
  }
  alert(output);
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
  } while(response === ""  ||  isValid === false)
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
function restrictedListValidation(input, allowableValues){
  let isValid = false;
  for (let i = 0; i < allowableValues.length; i++) {
    const value = allowableValues[i];
    if (input === value) {
      isValid = true;
    }
  }

  return isValid;
}

//#endregion