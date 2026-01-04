import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SimulationRoutingModule } from './simulation-routing.module';
import { SimulationParametersComponent } from './simulation/simulation-parameters.component';
import { ScenarioLoaderComponent } from '@minsky/mod-scenario-loader';


@NgModule({
    imports: [CommonModule, SimulationRoutingModule, SimulationParametersComponent, ScenarioLoaderComponent],
})
export class SimulationModule { }
