import { GlobalData } from './global-data';

export class CountryData {
    country: string;
    totalConfirmed: number;
    totalDeaths : number;
    totalRecovered : number;
    totalActive : number;
    states:GlobalData[];
}