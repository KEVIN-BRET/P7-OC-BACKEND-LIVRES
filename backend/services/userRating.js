const book = {
  userId: 123,
  title: "livre test",
  author: "Kev",
  year: 2020,
  genre: roman,
  ratings: [
    { userId: '5fb0a7a2b3c9d4e1f', grade: 5 },
    { userId: '5fbd9b2b0fc9d4e1f', grade: 2 },
    { userId: '5fbd9b2b0wxv2b3c9', grade: 5 },
    { userId: '5fbd9b2b0fwxv2b3c', grade: 3 },
    { userId: '5fbd9b2b0f0a7≈©vd', grade: 1 },
    { userId: '5fbd9b2b0f0≈©ve1f', grade: 4 },
  ],
  averageRating: { type: Number },
};


const totalGrades = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);

const averageRating = Math.round((totalGrades / book.ratings.length) * 10) / 10;

console.log(averageRating);