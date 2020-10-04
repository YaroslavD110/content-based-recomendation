import * as path from 'path';
import * as fs from 'fs';

interface IFilm {
  id: string;
  title: string;
  year: number;
  genres: string[];
  countries: string[];
  duration: number;
  premiere: string; // Date string
  rating: number;

  genresVector?: number[];
}

interface IGenre {
  index: number;
  name: string;
}

function cosineSim(A: number[], B: number[]) {
  const length = A.length > B.length ? B.length : A.length;
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;

  for (let i = 0; i < length; i++){
    dotproduct += (A[i] * B[i]);
    mA += (A[i] * A[i]);
    mB += (B[i] * B[i]);
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);

  return (dotproduct) / (mA * mB);
}

async function main() {
  const filmsJSON = fs.readFileSync(path.resolve('films-dataset.json'), {
    encoding: 'utf8'
  });
  const filmsDataset: IFilm[] = JSON.parse(filmsJSON);

  const genresJSON = fs.readFileSync(path.resolve('genres-dataset.json'), {
    encoding: 'utf8'
  });
  const genresDataset: IGenre[] = JSON.parse(genresJSON);

  const targetId = "5d626d873c02b939b9b68df4";
  const targetFilm = filmsDataset.find(f => f.id === targetId);

  targetFilm.genresVector = targetFilm.genres.sort((a, b) => {
    return a.localeCompare(b);
  }).map((gn) => {
    const genre = genresDataset.find(g => g.name === gn);
    return genre.index;
  });

  const scores = new Array();
  for (const film of filmsDataset) {
    film.genresVector = film.genres.sort((a, b) => {
      return a.localeCompare(b);
    }).map((gn) => {
      const genre = genresDataset.find(g => g.name === gn);
      return genre.index;
    });

    scores.push({
      id: film.id,
      genres: cosineSim(film.genresVector, targetFilm.genresVector)
    });
  }

  const sorted = scores.sort((a, b) => -(a.genres - b.genres));

  console.log("RES: ", sorted);
}

main();