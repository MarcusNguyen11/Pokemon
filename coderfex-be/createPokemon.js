const fs = require("fs");
const csv = require("csvtojson");
const { faker } = require("@faker-js/faker");

const createPokemon = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  let data = JSON.parse(fs.readFileSync("db.json"));
  let id = 1;
  newData = newData
    .map((e) => {
      if (e.Type2 === undefined)
        return {
          id: id++,
          name: e.Name,
          types: [e.Type1.toLowerCase()],
          url: `http://localhost:9000/images/${id - 1}.png`,
          height: faker.number.int(2),
          weight: faker.string.alphanumeric(10),
          abilites: faker.string.alphanumeric(20),
          category: faker.string.alphanumeric(20),
        };
      else {
        return {
          id: id++,
          name: e.Name,
          types: [e.Type1.toLowerCase(), e.Type2.toLowerCase()],
          url: `http://localhost:9000/images/${id - 1}.png`,
          height: faker.number.int(2),
          weight: faker.string.alphanumeric(10),
          abilites: faker.string.alphanumeric(20),
          category: faker.string.alphanumeric(20),
        };
      }
    })
    .filter((e) => e.id < 722);
  console.log(newData);
  data.pokemons = newData;
  fs.writeFileSync("db.json", JSON.stringify(data));
  console.log("done");
};

createPokemon();
