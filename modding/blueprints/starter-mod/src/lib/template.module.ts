import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './template.component';

@NgModule({
    imports: [CommonModule],
    declarations: [TemplateComponent],
    exports: [TemplateComponent],
})
export class TemplateModule { }
