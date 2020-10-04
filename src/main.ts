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
}

async function main() {
  const filmsJSON = fs.readFileSync(path.resolve('films.json'), {
    encoding: 'utf8'
  });
  const filmsDataset: IFilm[] = JSON.parse(filmsJSON);
}

main();