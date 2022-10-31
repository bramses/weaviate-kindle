// checking that id comes up every time for the same object
const { v4: uuidv4, v5: uuidv5 } = require("uuid");

const UUID_NAMESPACE = "83b39495-6acb-44ac-b59e-bf9200158bfe";

const clipping = {
    "author": "Pirsig, Robert M.",
    "clippingText": "He noted that although normally you associate Quality with objects, feelings of Quality sometimes occur without any object at all. This is what led him at first to think that maybe Quality is all subjective. But subjective pleasure wasn\u2019t what he meant by Quality either. Quality decreases subjectivity. Quality takes you out of yourself, makes you aware of the world around you. Quality is opposed to subjectivity.",
    "bookTitle": "Zen and the Art of Motorcycle Maintenance (Pirsig, Robert M.)",
    "location": "3901-3904",
    "dateAdded": "Thursday, October 1, 2020 12:42:47 PM"
}

const generateID = (clipping) => {
    const obj = {
        class: "Clipping",
        id: uuidv5(clipping.clippingText, UUID_NAMESPACE),
        properties: {
          bookTitle: clipping.bookTitle,
          author: clipping.author,
          clippingText: clipping.clippingText,
            date: clipping.date,
            location: clipping.location,
            dateAdded: clipping.dateAdded
        }
    }

    return obj;
}

const obj1 = generateID(clipping);
const obj2 = generateID(clipping);

console.log(obj1);
console.log(obj2);

