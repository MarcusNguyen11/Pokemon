const express = require("express");
const router = express.Router();
const fs = require("fs");
const { types } = require("util");
/**
 * params: /
 * description: get all pokemons
 * query:
 * method: get
 */

router.get("/", (req, res, next) => {
  //input validation
  const allowedFilter = ["types", "name"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    //allow title,limit and page query string only
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    //Filter data by title
    let result = [];

    if (filterKeys.length > 0) {
      let searchPokemon = [];
      pokemons.forEach((pokemon) => {
        if (
          filterQuery.types &&
          pokemon.types.includes(filterQuery.types) &&
          filterQuery.name &&
          pokemon.name === filterQuery.name
        ) {
          searchPokemon.push(pokemon);
        } else if (filterQuery.name && pokemon.name === filterQuery.name) {
          searchPokemon.push(pokemon);
        } else if (
          filterQuery.types &&
          pokemon.types.includes(filterQuery.types)
        ) {
          searchPokemon.push(pokemon);
        }
      });
      result = searchPokemon;
    } else {
      result = pokemons;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    //send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: get pokemon by Id
 * query:
 * method: get
 */

router.get("/:pokemonId", (req, res, next) => {
  //put input validation
  try {
    const { pokemonId } = req.params;
    //put processing
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    //find pokemon by id

    if (pokemonId < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }

    let targetIndex = pokemons.findIndex((pokemon) => {
      return pokemon.id === parseInt(pokemonId);
    });
    //put send response
    res.status(200).send({
      pokemon: pokemons[targetIndex],
      nextPokemon: pokemons[targetIndex + 1] || pokemons[0],
      previousPokemon:
        pokemons[targetIndex - 1] || pokemons[pokemons.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: create a pokemon
 * query:
 * method: post
 */

router.post("/", (req, res, next) => {
  //post input validation

  const pokemonTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flying",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];
  try {
    const { name, id, types, url } = req.body;
    if (!name || !id || !types || !url) {
      const exception = new Error(
        JSON.stringify({ errors: { message: `Missing body infor` } })
      );
      exception.statusCode = 400;
      throw exception;
    }
    function CheckTypes(type) {
      return pokemonTypes.includes(type);
    }
    if (!types.every(CheckTypes)) {
      const exception = new Error(
        JSON.stringify({ errors: { message: `Type is not exist` } })
      );
      exception.statusCode = 400;
      throw exception;
    }
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    if (pokemons.find((pokemon) => pokemon.id === parseInt(id))) {
      const exception = new Error(
        JSON.stringify({ errors: { message: `Pokemon Id is exist` } })
      );
      exception.statusCode = 400;
      throw exception;
    }
    if (pokemons.find((pokemon) => pokemon.name === name)) {
      const exception = new Error(
        JSON.stringify({ errors: { message: `The name of Pokemon is exist` } })
      );
      exception.statusCode = 400;
      throw exception;
    }

    //post processing
    const newPokemon = {
      name,
      id: parseInt(id),
      url,
      types,
    };
    //Add new pokemon to pokemon JS object
    pokemons.push(newPokemon);
    //Add new pokemon to db JS object
    db.pokemons = pokemons;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("db.json", db);
    //post send response
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});


/**
 * params: /
 * description: update pokemon
 * query:
 * method: delete
 */

router.delete("/:pokemonId", (req, res, next) => {
  //delete input validation
  try {
    const { pokemonId } = req.params;
    //delete processing
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    //find pokemon by id
    const targetIndex = pokemons.findIndex((pokemon) => pokemon.id === parseInt(pokemonId));
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    //filter db pokemons object
    db.pokemons = pokemons.filter((pokemon) => pokemon.id !== parseInt(pokemonId));

    //db JSobject to JSON string

    db = JSON.stringify(db);
    //write and save to db.json

    fs.writeFileSync("db.json", db);
    //delete send response
    res.status(200).send(pokemons[targetIndex -1]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
