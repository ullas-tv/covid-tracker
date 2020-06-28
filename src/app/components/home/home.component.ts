import { Component, OnInit } from '@angular/core';
import { CovidDataService } from 'src/app/services/covid-data.service';
import { CountryData } from 'src/app/models/country-data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  globalDataList: CountryData[] = [];
  totalConfirmed: number = 0;
  totalActive: number = 0;
  totalDeaths: number = 0;
  totalRecovered: number = 0;
  countryName: string[] = [];
  loading: boolean = true;
  chart = {
    PieChart: 'PieChart',
    ColumnChart: 'ColumnChart',
    height: 400,
    width: 600,
    columns: ['Countries', 'Cases'],
    title: 'Countries Having Confirmed Cases > 1L ',
    options: {
      animation: {
        duration: 1000,
        easing: 'out',
      },
      is3D: true,
    },
  };
  chartDataTable = [];

  constructor(private covidDataService: CovidDataService) { }

  ngOnInit(): void {
    let now = new Date();
    console.log('Date in OnInit: ', now);
    this.covidDataService.getGlobalCovidData(now).subscribe(
      (result: CountryData[]) => {
        this.globalDataList = Object.values(result);

        this.globalDataList.forEach((cs) => {
          if (!Number.isNaN(cs.totalConfirmed)) {
            this.totalActive += cs.totalActive;

            this.totalDeaths += cs.totalDeaths;

            this.totalConfirmed += cs.totalConfirmed;

            this.totalRecovered += cs.totalRecovered;
          }
        });
        this.initChart('confirmed');
        this.loading = false;
      },
    );
  }

  initChart(caseType: string) {
    let value: number;

    this.chartDataTable = [];

    this.globalDataList.forEach((cs) => {
      if (caseType === 'confirmed')
        if (cs.totalConfirmed > 100000) value = cs.totalConfirmed;

      if (caseType === 'active')
        if (cs.totalConfirmed > 100000) value = cs.totalActive;

      if (caseType === 'recovered')
        if (cs.totalConfirmed > 100000) value = cs.totalRecovered;

      if (caseType === 'deaths')
        if (cs.totalConfirmed > 100000) value = cs.totalDeaths;

      this.chartDataTable.push([cs.country, value]);
    });

    console.log('Chart Data Table is', this.chartDataTable);
  }

  updateChart(radioValue: HTMLInputElement) {
    console.log('radioValue', radioValue);
    this.initChart(radioValue.value);
  }
}
