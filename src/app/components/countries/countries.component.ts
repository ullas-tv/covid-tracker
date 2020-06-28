import { Component, OnInit, OnDestroy } from '@angular/core';
import { CovidDataService } from 'src/app/services/covid-data.service';
import { merge } from 'rxjs';
import { CountryData } from 'src/app/models/country-data';
import { DatewiseData } from 'src/app/models/datewise-data';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss'],
})
export class CountriesComponent implements OnInit {
  countriesName: string[] = [];
  globalDataList: CountryData[] = [];
  totalConfirmed: number = 0;
  totalActive: number = 0;
  totalDeaths: number = 0;
  totalRecovered: number = 0;
  datewiseData: any = [];
  selectedCountryData: DatewiseData[] = [];
  chartDataTable = [];
  loading: boolean = true;
  selectedCountry = '';
  chart = {
    columns: ['Date', 'Cases'],
    LineChart: 'LineChart',
    height: 500,
    width: 500,
    title: 'Covid Cases',
    options: {
      legend: 'true',
      series: {
        0: { color: '#e2431e' },
      },
      animation: {
        duration: 1000,
        easing: 'out',
      },
      is3D: true,
    },
  };

  constructor(private covidDataService: CovidDataService) { }


  ngOnInit(): void {
    this.totalActive = 0;
    this.totalDeaths = 0;
    this.totalConfirmed = 0;
    this.totalRecovered = 0;
    this.selectedCountryData = [];
    let now = new Date();
    merge(
      this.covidDataService.getDatewiseData().pipe(
        map((result) => {
          this.datewiseData = result;
        })
      ),
      this.covidDataService.getGlobalCovidData(now).pipe(
        map((result: CountryData[]) => {
          this.globalDataList = result;
          this.globalDataList.forEach((cs) => {
            this.countriesName.push(cs.country);
          });
        })
      )
    ).subscribe({
      complete: () => {
        this.getSelectedCountryData('India');
        this.loading = false;
      },
    });
  }

  getSelectedCountryData(country: string) {
    this.selectedCountry = country;
    this.totalActive = 0;
    this.totalDeaths = 0;
    this.totalConfirmed = 0;
    this.totalRecovered = 0;
    this.selectedCountryData = [];
    this.globalDataList.forEach((cs) => {
      if (cs.country == country) {
        if (!Number.isNaN(cs.totalActive)) {
          this.totalActive = cs.totalActive;
        }
        if (!Number.isNaN(cs.totalDeaths)) {
          this.totalDeaths = cs.totalDeaths;
        }
        if (!Number.isNaN(cs.totalConfirmed)) {
          this.totalConfirmed = cs.totalConfirmed;
        }
        if (!Number.isNaN(cs.totalRecovered)) {
          this.totalRecovered = cs.totalRecovered;
        }
      }
    });
    this.selectedCountryData = this.datewiseData[country];
    console.log('Selected Country data', this.selectedCountryData);
    this.updateChart();
  }

  updateChart() {
    console.log(this.selectedCountryData);
    this.chartDataTable = [];
    this.selectedCountryData.forEach((cs) => {
      this.chartDataTable.push([cs.date, cs.cases]);
    });
    console.log(this.chartDataTable);
  }
}
