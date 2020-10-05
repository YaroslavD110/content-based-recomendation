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

const TOP_NUMBER = 5;
const TARGET_ID = '5d626d873c02b939b9b68df4';

function cosineSim(a: number[], b: number[]) {
  const A = [...a];
  const B = [...b];

  if (A.length > B.length) {
    B.push(...([...new Array(A.length - B.length)].map(() => 0)));
  } else if (B.length > A.length) {
    A.push(...([...new Array(B.length - A.length)].map(() => 0)));
  }
  
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;

  for (let i = 0; i < A.length; i++){
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

  const targetFilm = filmsDataset.find(f => f.id === TARGET_ID);

  targetFilm.genresVector = targetFilm.genres.sort((a, b) => {
    return a.localeCompare(b);
  }).map((gn) => {
    const genre = genresDataset.find(g => g.name === gn);
    return genre.index;
  });

  const scores = new Array();
  for (const film of filmsDataset) {
    if (film.id === TARGET_ID) {
      continue;
    }

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
  const top = sorted.slice(0, TOP_NUMBER).map((s) => {
    const film = filmsDataset.find((f) => f.id === s.id);
    
    return { title: film.title, score: s.genres };
  });

  console.log(`Top ${TOP_NUMBER} most similar to ${targetFilm.title} (according to genres):\n`);
  console.log(top.map(t => `"${t.title}" (with similarity score ${t.score})`).join('\n'));
  console.log('\n');
}

main();