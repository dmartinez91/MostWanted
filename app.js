"use strict";


//Menu functions.
//Used for the overall flow of the application.
//Deprecated, using HTML/CSS interface
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
  // "person" comes in as an array of people. Need to extract just the one we want
  person = getSinglePerson(person, people);

  // PersonInfoOptions: a restrictive list of allowable values to supply to the validation function
  let personInfoOptions = ["info", "family", "descendants", "restart", "quit"];
  let displayOption = promptFor("Found " + person.firstName + " " + person.lastName + " . Do you want to know their 'info', 'family', or 'descendants'? Type the option you want or 'restart' or 'quit'", restrictedListValidation, personInfoOptions).toLowerCase();

  // Menu selection
  switch(displayOption){
    case "info":
      displayPerson(person); // Display individual info
      break;
    case "family":
      displayFamily(people, person); // Display immediate family
      break;
    case "descendants":
      displayDescendants(person, people); // Display full lineage with person being the root
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

// Convert array into person object or restart app if no results found
function getSinglePerson(person, people) {
  if (person.length === 1) {
    person = person[0];
  } else if (person.length === 0) {
    alert("Did not find any results that match that criteria.");
    app(people);
  } else {
    person = displayPeople(person);
  }
  return person;
}

// Menu specifically used for non-name searches
function getAge(dateString) 
{
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let daysUntilBirthDay = today.getMonth() - birthDate.getMonth();
    if (daysUntilBirthDay < 0 || (daysUntilBirthDay === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
}


function searchMenu(people){
  let userSearch = '';
  // Currently searchable fields
  let fieldOptions = ["gender", "height", "weight", "eye color", "first name", "last name", "occupation", "dob", "age", "done"];
  let fields = [];
  let message = 'Which trait(s) would you like to search?\n - gender\n - height\n - weight\n - eye color\n - first name\n - last name\n - occupation\n - age\n - DOB\n - Or type done when you are finished'
  // Make sure the list of criteria doesn't exceed 5, and add valid criteria to "fields"
  while(userSearch != 'done' && fields.length < 5){
    userSearch = promptFor(message, restrictedListValidation, fieldOptions).toLowerCase();
    let selectedCriteria = (`selected criteria\n ${userSearch}`)
    
    if (userSearch != 'done'){
      let isAlreadyInFields = false;
      for (let i = 0; i < fields.length; i++) {
        const currentField = fields[i];
        if (currentField === userSearch) {
          isAlreadyInFields = true;
          alert(`${userSearch} has already been added, please add a different criteria.`);
        }
      }
      if (!isAlreadyInFields) {
        fields.push(userSearch);
        message += `\n selected criteria: ${userSearch} `
      }
    }
  }
  return searchMultiple(fields, people);
}

//#endregion

//Filter functions.
/////////////////////////////////////////////////////////////////
//#region 

//Find a person by name. Returns an array of people, handled in the main menu
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
  return foundPerson;
}

// Search by a single parameter field
function searchBy(field, people, value=-1) {
  let genderOptions = ["male", "female"];
  let eyeColorOptions = ["black", "hazel", "brown", "blue", "green"];
  let message = `What ${field} would you like to search for?`;
  let userInput;
  if (value === -1) {
    if (field === "gender") {
      userInput = promptFor(message, restrictedListValidation, genderOptions);
    } else if (field === "eye color") {
      userInput = promptFor(message, restrictedListValidation, eyeColorOptions);
    } else if (field === "first name" || field === "last name" || field === "occupation") {
      userInput = promptFor(message, autoValid);
    } else if (field === "dob") {
      userInput = promptFor((message + "\n(d/m/yyyy)"), dobVerification);
    } else {
      userInput = promptFor(message, numericValidation);
    }
  } else {
    userInput = value;
  }
  
  let fieldMatches = people.filter(function (el) {
    let match = false;
    switch(field){
      case 'gender': 
        match = (el.gender == userInput);
        break;
      case 'height': 
        match = (el.height == userInput);
        break;
      case 'weight': 
        match = (el.weight == userInput);
        break;
      case 'eye color': 
        match =  (el.eyeColor == userInput);
        break;
      case 'first name':
        match = (el.firstName.toLowerCase() == userInput);
        break;
      case 'last name':
        match = (el.lastName.toLowerCase() == userInput);
        break;
      case 'occupation':
        match = (el.occupation == userInput);
        break;
      case 'dob':
        match = (el.dob == userInput);
        break;
      case 'age':
        match = (getAge(el.dob) == userInput);
        break;
    }
    return match;
  })

  return fieldMatches;
}

// Processes the multiple search criteria input by the user and continuously filters array down
function searchMultiple(fields, people) {
  let currentMatches = people;

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    currentMatches = searchBy(field, currentMatches);
  }

  return currentMatches;
}

// Get all children and grandchildren of a given person
function findDescendants(person, people) {
  let parentId = person.id;

  // Find all people that list the current person as a parent
  let children = findChildren(parentId, people);

  // Find all people that list the children as a parent
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.children = findDescendants(child, people);
  }

  return children;
}

// Create a family object with the parents, spouse, children, and siblings of a given person
function findFamily(person, people) {
  let currentSpouseId = person.currentSpouse;
  let currentSpouse = findById(currentSpouseId, people);

  // 0, 1, or 2 parents
  let parentIds = person.parents;
  let parents = findParents(parentIds, people);
  let siblings = findSiblings(person.id, parentIds, people);
  let children = findChildren(person.id, people);

  let family = {
    "parents": parents,
    "currentSpouse": currentSpouse,
    "children": children,
    "siblings": siblings
  };

  return family;
}

// Find the people that match the values in parent ids
function findParents(parentIds, people) {
  let parents = [];
  parents = people.filter(function (el) {
    let isParent = false;
    for (let i = 0; i < parentIds.length; i++) {
      const parentId = parentIds[i];
      if (parentId === el.id) {
        isParent = true;
      }
    }
    return isParent;
  })
  return parents;
}

// Find the people that have a given parentId listed as a parent
function findChildren(parentId, people) {
  let children = [];
  children = people.filter(function (el) {
    let isChild = false;
    for (let i = 0; i < el.parents.length; i++) {
      const currentParentId = el.parents[i];
      if (parentId === currentParentId) {
        isChild = true;
      }
    }
    return isChild;
  })
  return children;
}

// Find all the people that share a parent id except the original person
function findSiblings(personId, parentIds, people) {
  let parents = findParents(parentIds, people);
  let siblings = [];
  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    let currentSiblings = findChildren(parent.id, people);
    for (let j = 0; j < currentSiblings.length; j++) {
      const sibling = currentSiblings[j];
      if (sibling.id !== personId) {
        siblings.push(sibling);
      }
    }
  }
  return siblings;
}

// Find the person with a given ID
function findById(id, people) {
  let person = people.filter(function(el){
    return (el.id === id);
  })
  return person;
}

// Low priority search fields: first name, last name, DOB, age, occupation, etc.
////////////////////////////////////////////////////////////////////////////////




//#endregion

//Display functions.
//Functions for user interface.
/////////////////////////////////////////////////////////////////
//#region 

// Display full list of people returned from a search
function displayPeople(people){

  let output = "Found the following people: \n";
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    output += `${i + 1}: ${person.firstName} ${person.lastName}\n`;
  }

  output += `\nWhich person would you like to select?`;

  let userInput = promptFor(output, numericValidation, [1, people.length]);
  let selectedPerson = people[userInput - 1];

  return selectedPerson;
}

// Retrieve and display information about the current person
function displayPerson(person){
  let personInfo = "";

  for (const property in person) {
    if (property === "id" ||
        property === "parents" ||
        property === "currentSpouse" ||
        property === "children"){
      continue;
    }
    personInfo += `${property}: ${person[property]}\n`;
  }
  
  alert(personInfo);
}

// Retrieve and display immediate family members
function displayFamily(people, person) {
  let immediateFamily = findFamily(person, people);

  // Properties are spouse, parent, child, sibling
  // For each person in the array at a given property, add them to the output
  let output = "";
  for (const property in immediateFamily){
    for (let i = 0; i < immediateFamily[property].length; i++) {
      const relative = immediateFamily[property][i];
      output += `${property}: ${relative.firstName} ${relative.lastName}\n`;
    }
  }
  alert(output);
}

// Retrieve and display all descendants of a person
function displayDescendants(person, people) {
  // Note: This function does not currently support descendants beyond grandchildren.
  person.children = findDescendants(person, people);

  let output = "";
  if (person.children.length === 0) {
    output = "This person has no descendants.";
  }
  else {
    // First layer is children
    for (let i = 0; i < person.children.length; i++) {
      const child = person.children[i];
      output += `Child: ${child.firstName} ${child.lastName}\n`;

      // Second layer is grandchildren
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
function promptFor(question, valid, args=[]){
  do{
    var response = prompt(question).trim().toLowerCase();
  } while(!response ||  !valid(response, args))
  return response;
}

// helper function/callback to pass into promptFor to validate yes/no answers.
function yesNo(input, args){
  if(input == "yes" || input == "no"){
    return true;
  }
  else{
    return false;
  }
}

// helper function to pass in as default promptFor validation.
//this will always return true for all inputs.
function autoValid(input, args){
  return true; // default validation only
}

// Verifies that an input exists within a list of allowable values (similar to a dropdown)
function restrictedListValidation(input, allowableValues){
  let isValid = false;
  for (let i = 0; i < allowableValues.length; i++) {
    const value = allowableValues[i].toLowerCase();
    if (input == value) {
      isValid = true;
    }
  }

  return isValid;
}

// Verifies that an input is a number with optional limits available
function numericValidation(input, limits) {
  // Default values
  let upperLimit = 9001;
  let lowerLimit = 0;
  // If limits are provided, use those values instead
  if (limits.length === 2) {
    lowerLimit = limits[0];
    upperLimit = limits[1];
  }

  return (input <= upperLimit && input >= lowerLimit);
}

// Verifies user provided valid date string
function dobVerification(input, args=[]) {
  let dateParts = input.split('/');
  // if the dateparts isn't 3 items long, it's definitely formatted wrong
  if (dateParts.length != 3) {
    return false;
  }
  
  // Make sure each of the parts of the date string are appropriate
  let selectedDate = new Date(input);
  let selectedDay = selectedDate.getDate();
  let selectedMonth = selectedDate.getMonth() + 1;
  let selectedYear = selectedDate.getFullYear();
  if (!selectedDay || !selectedMonth || !selectedYear){
    return false;
  }

  return true;
}

//#endregion

//Web page functions.
//Functions utilized by the HTML to display content.
/////////////////////////////////////////////////////////////////
//#region


//
// Search Implementation
//

// Initiate search from main page
function search(people) {
  let fields = getInputs();

  let searchResults = people;
  for (const property in fields) {
    const value = fields[property];
    if (value != -1) {
      searchResults = searchBy(property, searchResults, value);
    }
  }

  if (searchResults.length === 0) {
    showPage("noResultsPage", "searchPage");
  } else if (searchResults.length === 1) {
    prepareResultsPage(searchResults);
    prepareFamilyPage(searchResults, people);
    showPage("resultsPage", "searchPage");
  } else {
    prepareMultipleResultsPage(searchResults);
    showPage("multipleResultsPage", "searchPage");
  }
  return false;
}

// Get search values from search page
function getInputs() {
  // Only need to validate DOB. Everything else is either a list or would be autovalidated
  let dob = getValueOrDefault(document.getElementById("dobSearch").value);
  if (dob != -1) {
    let dobValid = dobVerification(dob);
    if (!dobValid) {
      alert("DOB invalid. Please use M/D/YYYY format.");
      return false;
    }
  }

  let fields = {};

  // Retrieve data from page
  fields["first name"] = getValueOrDefault(document.getElementById("fnameSearch").value);
  fields["last name"] = getValueOrDefault(document.getElementById("lnameSearch").value);
  fields["gender"] = getValueOrDefault(document.getElementById("genderSearch").value);
  fields["age"] = getValueOrDefault(document.getElementById("ageSearch").value);
  fields["dob"] = getValueOrDefault(document.getElementById("dobSearch").value);
  fields["height"] = getValueOrDefault(document.getElementById("heightSearch").value);
  fields["weight"] = getValueOrDefault(document.getElementById("weightSearch").value);
  fields["eye color"] = getValueOrDefault(document.getElementById("eyecolorSearch").value);
  fields["occupation"] = getValueOrDefault(document.getElementById("occupationSearch").value);

  return fields;
}

// Makes sure empty fields aren't added to search
function getValueOrDefault(value) {
  if (value){
    return value;
  } else {
    return -1;
  }
}

// Used only to get one person from a list of multiple people
function selectPerson(people) {
  let selectedPersonId = document.getElementById("peopleSelection").value;
  let selectedPerson = findById(Number(selectedPersonId), people);
  prepareResultsPage(selectedPerson);
  prepareFamilyPage(selectedPerson, people);
  showPage("resultsPage", "multipleResultsPage");
}

//
// HTML Manipulation
//

// Used to switch "pages" of document without refreshing
function showPage(pageToShow, pageToHide) {
  document.getElementById(pageToHide).style.display = "none";
  document.getElementById(pageToShow).style.display = "block";
  return false;
}

// Reset all items in HTML object
function resetList(field, countId) {
  let countObject = document.getElementById(countId);
  let count = countObject.value;
  for (let i = 0; i < count; i++) {
    let currentId = `${field}${i}`
    let element = document.getElementById(currentId);
    element.parentElement.removeChild(element);
  }
  if (document.getElementById(`${field}1000`)) {
    let element = document.getElementById(`${field}1000`);
    element.parentElement.removeChild(element);
  }

  countObject.value = 0;
  return false;
}

// Add all items in array to HTML object
function addEachTo(array, type, addTo, field, countId=-1) {
  if (array.length > 0) {
    for (let i = 0; i < array.length; i++) {
      const person = array[i];
      let personName = `${person.firstName} ${person.lastName}`
      addItemTo(personName, type, addTo, "", field, i)
    }
  } else {
    addItemTo(`No ${field} on file`, type, addTo, "", field, 1000);
  }
}

// Add one item to HTML object
function addItemTo(textValue, type, addTo, value, field, countId) {
  let currentParent = document.getElementById(addTo);
  let newItemText = document.createTextNode(textValue);
  let newItem = document.createElement(type);
  newItem.appendChild(newItemText);
  if (countId != -1) {
    newItem.id = `${field}${countId}`;
  }
  if (value != "") {
    newItem.value = value;
  }
  currentParent.appendChild(newItem);
}


//
// Page preparation & scrubbing
//

// Clean search page before navigating to it
function prepareSearchPage() {
  // Empty all fields
  document.getElementById("fnameSearch").value = "";
  document.getElementById("lnameSearch").value = "";
  document.getElementById("genderSearch").selectedIndex = "";
  document.getElementById("dobSearch").value = "";
  document.getElementById("heightSearch").value = "";
  document.getElementById("weightSearch").value = "";
  document.getElementById("eyecolorSearch").selectedIndex = "";
  document.getElementById("occupationSearch").value = "";
  return false;
}

// Get all of the people found in the search into dropdown
function prepareMultipleResultsPage(results) {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    let newItemText = `${result.firstName} ${result.lastName}`;
    addItemTo(newItemText, "option", "peopleSelection", result.id, "", -1);
  }
}

// Fill out data for results page before showing
function prepareResultsPage(results) {
  // Get the person out of the array of people
  let person = results[0];

  // Reassign the values on all the fields
  document.getElementById("fnameResults").innerHTML = person["firstName"];
  document.getElementById("lnameResults").innerHTML = person["lastName"];
  document.getElementById("genderResults").innerHTML = person["gender"];
  document.getElementById("ageResults").innerHTML = getAge(person["dob"]);
  document.getElementById("dobResults").innerHTML = person["dob"];
  document.getElementById("heightResults").innerHTML = person["height"];
  document.getElementById("weightResults").innerHTML = person["weight"];
  document.getElementById("eyecolorResults").innerHTML = person["eyeColor"];
  document.getElementById("occupationResults").innerHTML = person["occupation"];
  return false;
}

// Fill out data for family page before showing
function prepareFamilyPage(personArray, people) {
  resetFamilyPage();
  let person = personArray[0];
  let family = findFamily(person, people);
  if (family["currentSpouse"].length == 1) {
    let spouse = family["currentSpouse"][0];
    document.getElementById("spouseFamily").value = `${spouse.firstName} ${spouse.lastName}`;
  } else {
    document.getElementById("spouseFamily").value = "No spouse on file";
  }

  // Need to keep track of counts to get rid of elements during reset
  document.getElementById("firstAndLastFamily").value = `${person.firstName} ${person.lastName}`;
  addEachTo(family["parents"], "li", "parentsFamily", "parents");
  document.getElementById("numberOfParents").value = `${family["parents"].length}`;
  addEachTo(family["siblings"], "li", "siblingsFamily", "siblings");
  document.getElementById("numberOfSiblings").value = `${family["siblings"].length}`;
  addEachTo(family["children"], "li", "childrenFamily", "children");
  document.getElementById("numberOfChildren").value = `${family["children"].length}`;

  // Get grandchildren from list of children
  family["grandchildren"] = []
  for (let i = 0; i < family["children"].length; i++) {
    let grandchildren = findChildren(family["children"][i].id, people);
    for (let j = 0; j < grandchildren.length; j++) {
      const grandchild = grandchildren[j];
      family["grandchildren"].push(grandchild);
      document.getElementById("numberOfGrandchildren").value++;
    }
  }
  addEachTo(family["grandchildren"], "li", "grandchildrenFamily", "grandchildren");
}

// Reset all fields on family page
function resetFamilyPage() {
  document.getElementById("firstAndLastFamily").value = "";
  document.getElementById("spouseFamily").value = "";
  resetList("parents", "numberOfParents");
  resetList("siblings", "numberOfSiblings");
  resetList("children", "numberOfChildren");
  resetList("grandchildren", "numberOfGrandchildren");
}

// Navigate back to the search page after clearing it
function newSearch(currentPage) {
  prepareSearchPage();
  showPage("searchPage", currentPage);
  return false;
}


//#endregion