import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, count, catchError } from 'rxjs/operators';
import { GlobalData } from '../models/global-data';
import { CountryData } from '../models/country-data';
import { DatewiseData } from '../models/datewise-data';

@Injectable({
  providedIn: 'root',
})
export class CovidDataService {
  private datewiseDataUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';

  private baseDataUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';

  private extension = '.csv';
  private month: number;
  private year: number;
  private date: number;
  constructor(private http: HttpClient) { }

  converter(val: number) {
    // If value < 10 adding zero
    if (val < 10) {
      return '0' + val;
    }
    return val;
  }

  getDatewiseData() {
    return this.http.get(this.datewiseDataUrl, { responseType: 'text' }).pipe(
      map((result) => {
        let rows = result.split('\n');
        ////console.log(rows);
        let mainData = {};
        let header = rows[0];
        let dates = header.split(/,(?=\S)/);
        dates.splice(0, 4);
        rows.splice(0, 1);

        rows.forEach((row) => {
          let cols = row.split(/,(?=\S)/);
          let country = cols[1];
          cols.splice(0, 4);
          ////console.log(country,cols);

          mainData[country] = [];
          cols.forEach((value, index) => {
            let dw = new DatewiseData();
            dw.cases = +value;
            dw.country = country;
            dw.date = new Date(Date.parse(dates[index]));

            mainData[country].push(dw);
          });
        });
        ////console.log('Main Datewise Data', mainData);
        return mainData;
      })
    );
  }

  getUrl(date: Date) {
    ////console.log('Fetched Date is:', date);
    this.month = date.getMonth() + 1;
    this.date = date.getDate();
    this.year = date.getFullYear();
    let url = `${this.baseDataUrl}${this.converter(this.month)}
-${this.converter(this.date)}-${this.year}${this.extension}`;
    ////console.log('URL After Conversion is: ', url);
    return url;
  }


  getGlobalCovidData(date: Date) {
    return this.http
      .get(this.getUrl(date), { responseType: 'text' })
      .pipe(
        map((result) => {
          let data: GlobalData[] = [];
          let rows = result.split('\n');
          rows.splice(0, 1);
          rows.forEach((row) => {
            let columns = row.split(/,(?=\S)/);
            data.push({
              FIPS: columns[0],
              Admin2: columns[1],
              Province_State: columns[2],
              Country_Region: columns[3],
              Last_Update: columns[4],
              Lat: columns[5],
              Long_: columns[6],
              Confirmed: +columns[7],
              Deaths: +columns[8],
              Recovered: +columns[9],
              Active: +columns[10],
              Combined_Key: columns[11],
              Incidence_Rate: +columns[12],
              Case_Fatality_Ratio: +columns[13],
            });
          });
          let countryData = this.splitCountryWiseData(data);
          return countryData;
        }),
        catchError((error: HttpErrorResponse) => {
          ////console.log('Inside Error Response');
          if (error.status == 404) {
            ////console.log('Inside Error Response 404');
            let yesterday = new Date(Date.now() - 864e5);
            ////console.log('yesterday', yesterday);
            return this.getGlobalCovidData(yesterday);
          }
        })
      );
  }

  splitCountryWiseData(data: GlobalData[]) {
    let countryDataList: any[] = [];
    // Accepts the array and key
    let groupBy = (array, key) => {
      // Return the end result
      return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
          currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
      }, CountryData); // empty object is the initial value for result object
    };

    let dataGroupByCountry = groupBy(data, 'Country_Region');
    let tempcountryDataList = dataGroupByCountry;
    ////console.log(Object.keys(dataGroupByCountry));

    for (let key in tempcountryDataList) {
      // //console.log("Inside Forloop");
      let countryData = new CountryData();
      //Get the indexed item by the key:
      let indexedItem: GlobalData[] = Object.values(tempcountryDataList[key]);
      // //console.log(indexedItem);

      let active = 0;
      let deaths = 0;
      let confirmed = 0;
      let recovered = 0;
      for (let key_1 in indexedItem) {
        if (!Number.isNaN(indexedItem[key_1].Active)) {
          active += indexedItem[key_1].Active;
        }
        if (!Number.isNaN(indexedItem[key_1].Deaths)) {
          deaths += indexedItem[key_1].Deaths;
        }
        if (!Number.isNaN(indexedItem[key_1].Confirmed)) {
          confirmed += indexedItem[key_1].Confirmed;
        }
        if (!Number.isNaN(indexedItem[key_1].Recovered)) {
          recovered += indexedItem[key_1].Recovered;
        }
      }
      countryData.country = key;
      countryData.totalActive = active;
      countryData.totalDeaths = deaths;
      countryData.totalConfirmed = confirmed;
      countryData.totalRecovered = recovered;
      countryData.states = indexedItem;
      countryDataList.push(countryData);
    }
    //console.log('Dataservice GlobalList', countryDataList);
    return Object.values(countryDataList);
  }

}
