import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit, OnChanges {

  @Input("totalConfirmed") Confirmed = 0;
  @Input("totalActive") Active = 0;
  @Input("totalRecovered") Recovered = 0
  @Input("totalDeaths") Deaths = 0;

  totalConfirmed = 0;
  totalActive = 0;
  totalRecovered = 0;
  totalDeaths = 0;
  constructor() { }

  ngOnInit(): void {
    this.totalConfirmed = this.Confirmed;
    this.totalActive = this.Active;
    this.totalRecovered = this.Recovered;
    this.totalDeaths = this.Deaths;
  }

  ngOnChanges() {
    this.totalConfirmed = this.Confirmed;
    this.totalActive = this.Active;
    this.totalRecovered = this.Recovered;
    this.totalDeaths = this.Deaths;
  }

}
