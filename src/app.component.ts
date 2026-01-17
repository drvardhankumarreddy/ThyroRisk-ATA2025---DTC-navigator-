
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GuidelinesService, PatientCase } from './services/guidelines.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styles: [`
    @media print {
      @page { size: auto; margin: 0mm; }
      body { background-color: white; }
    }
  `]
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private guidelinesService = inject(GuidelinesService);
  
  today = new Date();
  step = signal<number>(1);

  // Form Setup
  form: FormGroup = this.fb.group({
    // Step 1: Demographics & Clinical
    name: [''],
    age: [45, [Validators.required, Validators.min(0)]],
    sex: ['Female'],
    clinicalSize: [2.5, [Validators.required, Validators.min(0)]],
    clinicalNodes: ['cN0', Validators.required],
    clinicalETE: ['None', Validators.required],
    contralateralNodules: [false],
    priorRadiation: [false],
    comorbidities: this.fb.group({
      osteoporosis: [false],
      atrialFib: [false],
      advancedAge: [false]
    }),
    
    // Step 2: Pathology
    tumorType: ['PTC', Validators.required],
    subtype: ['Classical'],
    pathologicalSize: [2.5, [Validators.min(0)]],
    pathologicalETE: ['None'],
    multifocality: [false],
    capsularInvasion: [false],
    vascularInvasion: [0], // For FTC/OTC
    pathologicalNodes: ['N0'],
    
    // Nodal details
    nodeSize: [0],
    numPosNodes: [0],
    ene: [false],
    marginsPositive: [false],
    
    // Mets
    distantMets: ['M0'],

    // Molecular Group
    molecular: this.fb.group({
      status: ['Unknown'], 
      braf: [false],
      tert: [false],
      ras: [false],
      tp53: [false],
      fusion: [false]
    }),

    // Step 5: Complications
    complications: this.fb.group({
      hypoparathyroidism: ['None'],
      vocalCordPalsy: ['None'],
      hematoma: [false],
      infection: [false],
      chyleLeak: [false]
    }),

    // Step 6: Surveillance
    tgSuppressed: [0.1],
    tgStimulated: [null],
    tshValue: [0.5],
    tgAbStatus: ['Negative'],
    
    imagingUS: ['Negative'],
    imagingRAI: ['Not Done'],
    imagingCrossSectional: ['Not Done']
  });

  private formValueSignal = signal(this.form.value);

  constructor() {
    this.form.valueChanges.subscribe(val => {
      this.formValueSignal.set(val);
    });
  }

  goToStep(s: number) {
    this.step.set(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  printReport() {
    window.print();
  }

  // --- Helpers ---
  toggleMets(e: Event) {
    const isChecked = (e.target as HTMLInputElement).checked;
    this.form.patchValue({ distantMets: isChecked ? 'M1' : 'M0' });
  }

  molecularStatus = computed(() => this.formValueSignal().molecular.status);

  toggleMolecular(e: Event) {
    const isChecked = (e.target as HTMLInputElement).checked;
    this.form.get('molecular')?.patchValue({ status: isChecked ? 'Tested' : 'Unknown' });
  }

  // --- Derived State (Assessments) ---

  ajccStage = computed(() => {
    const data = this.formValueSignal() as PatientCase;
    return this.guidelinesService.getAJCCStage(data);
  });

  surgicalRec = computed(() => {
    const data = this.formValueSignal() as PatientCase;
    return this.guidelinesService.getSurgicalRecommendation(data);
  });

  riskData = computed(() => {
    const data = this.formValueSignal() as PatientCase;
    return this.guidelinesService.getRiskStratification(data);
  });

  managementPlan = computed(() => {
    const risk = this.riskData();
    const data = this.formValueSignal() as PatientCase;
    return this.guidelinesService.getManagementPlan(risk, data);
  });

  complicationManagement = computed(() => {
    const data = this.formValueSignal() as PatientCase;
    return this.guidelinesService.getComplicationManagement(data);
  });

  responseAssessment = computed(() => {
    const data = this.formValueSignal() as PatientCase;
    return this.guidelinesService.getResponseAssessment(data);
  });

  surveillanceGuidance = computed(() => {
    const data = this.formValueSignal() as PatientCase;
    const response = this.responseAssessment();
    return this.guidelinesService.getSurveillanceGuidance(data, response);
  });
}
