const weaviate = require("weaviate-client");
var fs = require("fs");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");

const UUID_NAMESPACE = "83b39495-6acb-44ac-b59e-bf9200158bfe";

// if you use Docker-compose
const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

async function getJsonData() {
  const file = JSON.parse(fs.readFileSync("data.json", "utf8"));
  return file;
}

async function importClippings() {
  // Get the data from the data.json file
  const data = await getJsonData();

  // Prepare a batcher
  let batcher = client.batch.objectsBatcher();
  let counter = 0;

  data.clippings.forEach((clipping) => {
    // Construct an object with a class, id, properties and vector
    const obj = {
      class: "Clipping",
      id: uuidv5(clipping.text, UUID_NAMESPACE),
      properties: {
        bookTitle: clipping.bookTitle,
        author: clipping.author,
        clippingText: clipping.clippingText,
      },
    };

    // add the object to the batch queue
    batcher = batcher.withObject(obj);

    // When the batch counter reaches 20, push the objects to Weaviate
    if (counter++ == 20) {
      // flush the batch queue
      batcher
        .do()
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.error(err);
        });

      // restart the batch queue
      counter = 0;
      batcher = client.batch.objectsBatcher();
    }
  });

  // Flush the remaining objects
  batcher
    .do()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
}

var checkIfIDExists = async function (id) {
  client.data
    .checker()
    .withClassName("MyClass")
    .withId("df48b9f6-ba48-470c-bf6a-57657cb07390")
    .do()
    .then((exists) => {
      console.log(exists);
    })
    .catch((err) => console.error(err));
};

var deleteSchema = async function (className) {
  client.schema
    .classDeleter()
    .withClassName(className)
    .do()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
};

var setSchema = async function () {
  // await deleteSchema("Clipping"); // uncomment to delete the class

  var classObj = {
    class: "Clipping",
    description: "A single clipping with author, title, and text",
    properties: [
      {
        dataType: ["string"],
        description: "The name of the Book",
        name: "bookTitle",
      },
      {
        dataType: ["string"],
        description: "The name of the Author",
        name: "author",
      },
      {
        dataType: ["text"],
        description: "The text of the clipping",
        name: "clippingText",
        moduleConfig: {
          "text2vec-transformers": {
            skip: false,
            vectorizePropertyName: false,
          },
        },
      },
    ],
  };

  // add the schema
  client.schema
    .classCreator()
    .withClass(classObj)
    .do()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });

  // get and print the schema
  await getSchema();
};

var getSchema = async function () {
  client.schema
    .getter()
    .do()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
};

// importClippings();
getSchema();
