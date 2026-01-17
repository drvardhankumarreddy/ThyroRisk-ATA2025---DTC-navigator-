
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GuidelinesService, PatientCase } from './services/guidelines.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    @media print {
      @page { size: auto; margin: 0mm; }
      body { background-color: white; }
    }
  `],
  template: `
<div class="min-h-screen bg-slate-50 flex flex-col font-sans print:bg-white">
  
  <!-- Top Bar (Hidden on Print) -->
  <header class="bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
    <div class="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="bg-indigo-500 p-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">ATA 2025 Companion</h1>
          <p class="text-indigo-200 text-xs">Developed by Dr. Vardhan Kumar Reddy</p>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-right hidden sm:block">
          <div class="text-xs text-slate-400">Current Guideline</div>
          <div class="text-sm font-medium text-indigo-400">2025 Management Guidelines</div>
        </div>
      </div>
    </div>
  </header>

  <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
    
    <!-- Stepper Navigation (Hidden on Print) -->
    @if (step() !== 8) {
      <div class="mb-8 print:hidden">
        <div class="flex items-center justify-between max-w-7xl mx-auto relative overflow-x-auto pb-4">
          <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
          <div class="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-500 -z-10 rounded" [style.width.%]="(step() - 1) * 14.28"></div>

          @for (s of [1,2,3,4,5,6,7,8]; track s; let i = $index) {
            <button (click)="goToStep(s)" class="group flex flex-col items-center focus:outline-none min-w-[60px]">
              <div [class]="step() >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-500'" 
                   class="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-bold transition-colors shadow-sm text-sm md:text-base">
                   {{s === 8 ? '✓' : s}}
              </div>
              <div class="mt-2 text-[10px] md:text-xs font-medium text-gray-600 bg-slate-50 px-1 text-center whitespace-nowrap hidden sm:block">
                {{ ['Pre-Op', 'Path', 'Risk', 'Plan', 'Compl.', 'Surv.', 'Guidance', 'Report'][i] }}
              </div>
            </button>
          }
        </div>
      </div>
    }

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8" [class.block]="step() === 8">
      
      <!-- LEFT: Input Form Area -->
      @if (step() !== 8) {
        <div class="lg:col-span-7 space-y-6 print:hidden">
          <form [formGroup]="form" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            <!-- Step 1: Pre-Op & Demographics -->
            @if (step() === 1) {
              <div class="p-6">
                <div class="border-b pb-4 mb-6">
                  <h2 class="text-2xl font-bold text-slate-800">Demographics & Clinical</h2>
                  <p class="text-slate-500">Patient identity and pre-operative findings.</p>
                </div>
                
                <div class="space-y-6">
                  <!-- Demographics -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div class="md:col-span-1">
                       <label class="block text-sm font-semibold text-slate-700 mb-1">Name / ID</label>
                       <input type="text" formControlName="name" class="w-full rounded border-gray-300 shadow-sm p-2 text-sm" placeholder="Optional">
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Age (Years)</label>
                      <input type="number" formControlName="age" class="w-full rounded border-gray-300 shadow-sm p-2 text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Sex</label>
                      <select formControlName="sex" class="w-full rounded border-gray-300 shadow-sm p-2 text-sm bg-white">
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Clinical Tumor Size (cm)</label>
                    <input type="number" formControlName="clinicalSize" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-lg">
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Clinical Nodal Status</label>
                      <select formControlName="clinicalNodes" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white">
                        <option value="cN0">cN0 (No suspicious nodes)</option>
                        <option value="cN1a">cN1a (Central neck)</option>
                        <option value="cN1b">cN1b (Lateral neck)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Clinical ETE (US)</label>
                      <select formControlName="clinicalETE" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white">
                        <option value="None">None visible</option>
                        <option value="Gross (Strap Muscles)">Suspected Muscle Invasion</option>
                        <option value="Gross (Major Structures)">Suspected Trachea/Vessel Invasion</option>
                      </select>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center">
                      <input type="checkbox" formControlName="contralateralNodules" id="contra" class="h-5 w-5 rounded border-gray-300 text-indigo-600">
                      <label for="contra" class="ml-3 text-sm text-slate-700 font-medium">Contralateral nodules?</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" formControlName="priorRadiation" id="rad" class="h-5 w-5 rounded border-gray-300 text-indigo-600">
                      <label for="rad" class="ml-3 text-sm text-slate-700 font-medium">Hx Head/Neck Radiation?</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="distMetsClin" [checked]="form.get('distantMets')?.value === 'M1'" (change)="toggleMets($event)" class="h-5 w-5 rounded border-gray-300 text-indigo-600">
                      <label for="distMetsClin" class="ml-3 text-sm text-slate-700 font-medium">Distant Metastasis (M1)?</label>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Step 2: Pathology -->
            @if (step() === 2) {
              <div class="p-6">
                <div class="border-b pb-4 mb-6">
                  <h2 class="text-2xl font-bold text-slate-800">Pathology Report</h2>
                  <p class="text-slate-500">Enter comprehensive histopathology data.</p>
                </div>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Histology</label>
                      <select formControlName="tumorType" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white">
                        <option value="PTC">Papillary (PTC)</option>
                        <option value="FTC">Follicular (FTC)</option>
                        <option value="OTC">Oncocytic (OTC)</option>
                        <option value="NIFTP">NIFTP</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Subtype</label>
                      <select formControlName="subtype" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white">
                        <option value="Classical">Classical</option>
                        <option value="Follicular Variant">Follicular Variant</option>
                        <option value="Tall Cell">Tall Cell</option>
                        <option value="Hobnail">Hobnail</option>
                        <option value="Columnar">Columnar</option>
                        <option value="Diffuse Sclerosing">Diffuse Sclerosing</option>
                        <option value="Solid">Solid</option>
                        <option value="Widely Invasive FTC/OTC">Widely Invasive FTC/OTC</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Pathologic Size (cm)</label>
                      <input type="number" formControlName="pathologicalSize" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border">
                    </div>
                     <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-1">Pathologic ETE</label>
                      <select formControlName="pathologicalETE" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white">
                        <option value="None">None / Intrathyroidal</option>
                        <option value="Microscopic">Microscopic</option>
                        <option value="Gross (Strap Muscles)">Gross (Strap Muscles)</option>
                        <option value="Gross (Major Structures)">Gross (Major Structures)</option>
                      </select>
                    </div>
                  </div>

                  <div class="flex space-x-6">
                    <div class="flex items-center">
                      <input type="checkbox" formControlName="multifocality" id="multi" class="h-4 w-4 rounded border-gray-300 text-indigo-600">
                      <label for="multi" class="ml-2 text-sm text-slate-700">Multifocal</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" formControlName="capsularInvasion" id="cap" class="h-4 w-4 rounded border-gray-300 text-indigo-600">
                      <label for="cap" class="ml-2 text-sm text-slate-700">Capsular Invasion</label>
                    </div>
                     @if (form.get('tumorType')?.value !== 'PTC') {
                       <div class="flex items-center">
                        <input type="checkbox" formControlName="vascularInvasion" id="vi" class="h-4 w-4 rounded border-gray-300 text-indigo-600">
                        <label for="vi" class="ml-2 text-sm text-slate-700">Vascular Invasion (Gross/Extensive)</label>
                      </div>
                     }
                  </div>

                   <div class="border-t pt-4">
                      <label class="block text-sm font-semibold text-slate-700 mb-3">Lymph Node Pathology</label>
                      <select formControlName="pathologicalNodes" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white mb-4">
                        <option value="Nx">Nx (Not assessed)</option>
                        <option value="N0">pN0 (Negative)</option>
                        <option value="N1a">pN1a (Central)</option>
                        <option value="N1b">pN1b (Lateral)</option>
                      </select>

                      @if (form.get('pathologicalNodes')?.value === 'N1a' || form.get('pathologicalNodes')?.value === 'N1b') {
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <div>
                            <label class="text-xs font-semibold text-slate-500 uppercase">Largest Node (cm)</label>
                            <input type="number" formControlName="nodeSize" class="mt-1 w-full rounded border-gray-300 text-sm p-2">
                          </div>
                           <div>
                            <label class="text-xs font-semibold text-slate-500 uppercase"># Positive Nodes</label>
                            <input type="number" formControlName="numPosNodes" class="mt-1 w-full rounded border-gray-300 text-sm p-2">
                          </div>
                          <div class="sm:col-span-2 flex items-center pt-2">
                            <input type="checkbox" formControlName="ene" id="enePath" class="h-4 w-4 rounded border-gray-300 text-indigo-600">
                            <label for="enePath" class="ml-2 text-sm text-slate-700 font-medium">Extranodal Extension (ENE)</label>
                          </div>
                        </div>
                      }
                   </div>
                   <!-- Molecular Section -->
                   <div class="border-t pt-4">
                     <div class="flex justify-between items-center mb-2">
                        <label class="block text-sm font-semibold text-slate-700">Molecular Profile</label>
                        <div class="flex items-center">
                          <span class="text-xs mr-2">Tested?</span>
                          <input type="checkbox" [checked]="molecularStatus() === 'Tested'" (change)="toggleMolecular($event)" class="h-4 w-4 text-indigo-600 rounded">
                        </div>
                     </div>
                     @if (molecularStatus() === 'Tested') {
                       <div formGroupName="molecular" class="grid grid-cols-3 gap-2">
                          <label class="flex items-center p-2 border rounded hover:bg-slate-50">
                            <input type="checkbox" formControlName="braf" class="rounded text-indigo-600 mr-2"><span class="text-xs">BRAF</span>
                          </label>
                          <label class="flex items-center p-2 border rounded hover:bg-slate-50">
                            <input type="checkbox" formControlName="tert" class="rounded text-indigo-600 mr-2"><span class="text-xs">TERT</span>
                          </label>
                          <label class="flex items-center p-2 border rounded hover:bg-slate-50">
                            <input type="checkbox" formControlName="ras" class="rounded text-indigo-600 mr-2"><span class="text-xs">RAS</span>
                          </label>
                          <label class="flex items-center p-2 border rounded hover:bg-slate-50">
                            <input type="checkbox" formControlName="tp53" class="rounded text-indigo-600 mr-2"><span class="text-xs">TP53</span>
                          </label>
                           <label class="flex items-center p-2 border rounded hover:bg-slate-50">
                            <input type="checkbox" formControlName="fusion" class="rounded text-indigo-600 mr-2"><span class="text-xs">Fusion</span>
                          </label>
                       </div>
                     }
                   </div>
                </div>
              </div>
            }

            <!-- Step 3: Risk & Staging (ReadOnly Review) -->
            @if (step() === 3) {
              <div class="p-8 space-y-8">
                <div class="text-center border-b pb-6">
                   <h2 class="text-2xl font-bold text-slate-800">Risk Assessment</h2>
                   <p class="text-slate-500">AJCC 8th Edition Staging & ATA Risk</p>
                </div>

                <!-- AJCC Card -->
                <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                   <div class="flex justify-between items-start">
                     <div>
                       <h3 class="text-lg font-bold text-indigo-900">AJCC TNM Stage (8th Ed)</h3>
                       <div class="text-4xl font-extrabold text-indigo-700 mt-2">{{ ajccStage().stage }}</div>
                       <div class="text-sm font-mono text-indigo-600 mt-1">{{ ajccStage().description }}</div>
                     </div>
                     <div class="bg-white p-2 rounded text-xs text-indigo-400 font-mono border border-indigo-100">
                       T: {{ ajccStage().t }}<br>N: {{ ajccStage().n }}<br>M: {{ ajccStage().m }}
                     </div>
                   </div>
                </div>

                <!-- ATA Risk Card -->
                <div [class]="riskData().color + ' rounded-xl p-6 border'">
                   <h3 class="text-lg font-bold">ATA 2025 Risk Stratification</h3>
                   <div class="text-3xl font-extrabold mt-2">{{ riskData().risk }}</div>
                   <p class="mt-1 opacity-90">{{ riskData().description }}</p>
                   <ul class="mt-4 space-y-1">
                     @for (r of riskData().reasoning; track r) {
                       <li class="flex items-start text-sm"><span class="mr-2">•</span>{{r}}</li>
                     }
                   </ul>
                </div>
                
                <div class="flex justify-center">
                  <button (click)="goToStep(4)" class="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium shadow hover:bg-indigo-700">Proceed to Plan</button>
                </div>
              </div>
            }

            <!-- Step 4: Management Plan & Comorbidities -->
            @if (step() === 4) {
              <div class="p-6">
                <div class="border-b pb-4 mb-6">
                  <h2 class="text-2xl font-bold text-slate-800">Management Plan</h2>
                  <p class="text-slate-500">Refine based on comorbidities.</p>
                </div>
                
                <div class="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 class="font-bold text-yellow-800 text-sm mb-2">Comorbidities Affecting TSH Suppression</h3>
                  <div class="space-y-2" formGroupName="comorbidities">
                    <label class="flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="osteoporosis" class="rounded text-yellow-600">
                      <span class="ml-2 text-sm text-slate-700">Osteoporosis / Reduced Bone Density</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="atrialFib" class="rounded text-yellow-600">
                      <span class="ml-2 text-sm text-slate-700">Atrial Fibrillation / Cardiac Issues</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="advancedAge" class="rounded text-yellow-600">
                      <span class="ml-2 text-sm text-slate-700">Advanced Age (>60y)</span>
                    </label>
                  </div>
                </div>

                <div class="space-y-6">
                   <!-- RAI Plan -->
                   <div class="bg-purple-50 p-5 rounded-xl border border-purple-100">
                      <h3 class="font-bold text-purple-900 mb-1">Radioactive Iodine (RAI)</h3>
                      <div class="text-xl font-bold text-purple-700">{{ managementPlan().rai.rec }}</div>
                      <div class="text-sm text-slate-600 mt-2">{{ managementPlan().rai.rationale }}</div>
                      @if (managementPlan().rai.dose !== 'N/A') {
                         <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
                           <div><span class="font-semibold">Dose:</span> {{managementPlan().rai.dose}}</div>
                           <div><span class="font-semibold">Prep:</span> {{managementPlan().rai.prep}}</div>
                         </div>
                      }
                   </div>

                   <!-- TSH Plan -->
                   <div class="bg-teal-50 p-5 rounded-xl border border-teal-100">
                      <h3 class="font-bold text-teal-900 mb-1">TSH Suppression Goal</h3>
                      <div class="text-xl font-bold text-teal-700">{{ managementPlan().tsh.target }}</div>
                      <div class="text-sm text-slate-600 mt-2">{{ managementPlan().tsh.rationale }}</div>
                   </div>
                </div>
              </div>
            }

            <!-- Step 5: Post-Op Complications -->
            @if (step() === 5) {
              <div class="p-6">
                <div class="border-b pb-4 mb-6">
                  <h2 class="text-2xl font-bold text-slate-800">Post-Op Complications</h2>
                  <p class="text-slate-500">Track complications to adjust long-term management.</p>
                </div>

                <div class="space-y-6" formGroupName="complications">
                   <!-- Hypoparathyroidism -->
                   <div class="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <label class="block text-sm font-bold text-yellow-900 mb-2">Hypoparathyroidism / Hypocalcemia</label>
                      <select formControlName="hypoparathyroidism" class="w-full rounded border-gray-300 text-sm p-2 bg-white">
                         <option value="None">None</option>
                         <option value="Transient">Transient (resolved < 6 mos)</option>
                         <option value="Permanent">Permanent (> 6 mos)</option>
                      </select>
                      <p class="text-xs text-yellow-700 mt-2">Requires Calcium & Calcitriol monitoring.</p>
                   </div>

                   <!-- Nerve Injury -->
                   <div class="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                      <label class="block text-sm font-bold text-orange-900 mb-2">Vocal Cord Palsy (RLN Injury)</label>
                      <select formControlName="vocalCordPalsy" class="w-full rounded border-gray-300 text-sm p-2 bg-white">
                         <option value="None">None</option>
                         <option value="Transient">Transient</option>
                         <option value="Permanent">Permanent</option>
                      </select>
                   </div>

                   <!-- Others -->
                   <div class="space-y-3 pt-2">
                      <label class="flex items-center cursor-pointer">
                        <input type="checkbox" formControlName="hematoma" class="rounded text-indigo-600">
                        <span class="ml-3 text-sm text-slate-700 font-medium">Post-op Hematoma requiring intervention</span>
                      </label>
                      <label class="flex items-center cursor-pointer">
                        <input type="checkbox" formControlName="infection" class="rounded text-indigo-600">
                        <span class="ml-3 text-sm text-slate-700 font-medium">Wound Infection</span>
                      </label>
                      <label class="flex items-center cursor-pointer">
                        <input type="checkbox" formControlName="chyleLeak" class="rounded text-indigo-600">
                        <span class="ml-3 text-sm text-slate-700 font-medium">Chyle Leak</span>
                      </label>
                   </div>
                </div>
              </div>
            }

            <!-- Step 6: Surveillance Data Input -->
            @if (step() === 6) {
              <div class="p-6">
                <div class="border-b pb-4 mb-6">
                  <h2 class="text-2xl font-bold text-slate-800">Surveillance Data</h2>
                  <p class="text-slate-500">Post-operative labs and imaging.</p>
                </div>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1">Suppressed Tg (ng/mL)</label>
                        <input type="number" formControlName="tgSuppressed" step="0.1" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border">
                     </div>
                     <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1">Stimulated Tg (Optional)</label>
                        <input type="number" formControlName="tgStimulated" step="0.1" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border">
                     </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1">Tg Antibodies (TgAb)</label>
                        <select formControlName="tgAbStatus" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border bg-white">
                          <option value="Negative">Negative</option>
                          <option value="Positive (Stable/Declining)">Positive (Stable/Declining)</option>
                          <option value="Positive (Rising)">Positive (Rising)</option>
                        </select>
                     </div>
                     <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1">Current TSH (mIU/L)</label>
                        <input type="number" formControlName="tshValue" step="0.1" class="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border">
                     </div>
                  </div>

                  <div class="border-t pt-4 space-y-4">
                    <h3 class="font-semibold text-slate-800">Imaging Findings</h3>
                    
                    <div class="grid grid-cols-1 gap-4">
                       <div>
                         <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Neck Ultrasound</label>
                         <select formControlName="imagingUS" class="w-full rounded border-gray-300 text-sm p-2">
                           <option value="Negative">Negative</option>
                           <option value="Suspicious Nodes">Suspicious Nodes</option>
                           <option value="Thyroid Bed Recurrence">Thyroid Bed Recurrence</option>
                         </select>
                       </div>
                       <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnostic RAI Scan</label>
                            <select formControlName="imagingRAI" class="w-full rounded border-gray-300 text-sm p-2">
                              <option value="Not Done">Not Done</option>
                              <option value="No Uptake">No Uptake</option>
                              <option value="Thyroid Bed Uptake">Thyroid Bed Uptake</option>
                              <option value="Distant Uptake">Distant Uptake (Mets)</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Cross Sectional (CT/MRI/PET)</label>
                            <select formControlName="imagingCrossSectional" class="w-full rounded border-gray-300 text-sm p-2">
                              <option value="Not Done">Not Done</option>
                              <option value="Negative">Negative</option>
                              <option value="Structural Disease">Structural Disease</option>
                            </select>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Step 7: Interpretation & Guidance -->
            @if (step() === 7) {
               <div class="p-8 space-y-8">
                 <div class="text-center border-b pb-6">
                   <h2 class="text-2xl font-bold text-slate-800">Detailed Guidance</h2>
                   <p class="text-slate-500">Interpretation of surveillance inputs & next steps.</p>
                 </div>

                 <!-- Interpretation Section -->
                 <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                   <div class="flex justify-between items-start">
                      <div>
                        <h3 class="text-lg font-bold text-indigo-900">Interpretation</h3>
                        <p class="text-indigo-800 mt-2 leading-relaxed">{{ surveillanceGuidance().interpretation }}</p>
                      </div>
                   </div>
                 </div>

                 <!-- Action Items Section -->
                 <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <h3 class="text-lg font-bold text-slate-800 mb-4">Recommended Next Steps</h3>
                   <ul class="space-y-3">
                     @for (action of surveillanceGuidance().actions; track action) {
                       <li class="flex items-start">
                         <span class="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs mr-3">✓</span>
                         <span class="text-slate-700">{{ action }}</span>
                       </li>
                     }
                   </ul>
                 </div>

                 <!-- Specific Advice Grid -->
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="bg-teal-50 border border-teal-100 rounded-xl p-5">
                     <h4 class="font-bold text-teal-900 mb-2">TSH Goal Adjustment</h4>
                     <p class="text-sm text-teal-800">{{ surveillanceGuidance().tshAdvice }}</p>
                   </div>
                   <div class="bg-blue-50 border border-blue-100 rounded-xl p-5">
                     <h4 class="font-bold text-blue-900 mb-2">Imaging Strategy</h4>
                     <p class="text-sm text-blue-800">{{ surveillanceGuidance().imagingAdvice }}</p>
                   </div>
                 </div>
                 
                 <div class="flex justify-center mt-4">
                   <button (click)="goToStep(8)" class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5">
                     View Final Report
                   </button>
                 </div>
               </div>
            }

            <!-- Footer Navigation (Hidden on Step 7, 8) -->
            @if (step() < 7) {
              <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                @if (step() > 1) {
                  <button (click)="goToStep(step() - 1)" class="text-slate-600 hover:text-slate-900 font-medium text-sm px-4 py-2">
                    ← Back
                  </button>
                }
                <div class="flex-grow"></div>
                <button (click)="goToStep(step() + 1)" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Next Step →
                </button>
              </div>
            }
          </form>
        </div>
      }

      <!-- RIGHT: Dynamic Assessment Panel (Hidden on Step 7, 8) -->
      @if (step() < 7) {
        <div class="lg:col-span-5 space-y-6 print:hidden">
          
          <!-- Contextual Header -->
          <div class="flex items-center space-x-2 text-slate-500 text-sm font-medium uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Live Guidance</span>
          </div>

          <!-- Surgical Rec (Step 1) -->
          @if (step() === 1) {
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div [class]="surgicalRec().color + ' p-4 border-b'">
                <h3 class="font-bold text-lg">Surgical Recommendation</h3>
              </div>
              <div class="p-6">
                <div class="text-2xl font-bold text-slate-900 mb-2 leading-tight">{{ surgicalRec().procedure }}</div>
                <div class="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded mb-4">{{ surgicalRec().level }}</div>
                <ul class="space-y-2">
                  @for (reason of surgicalRec().considerations; track reason) {
                    <li class="flex items-start text-sm text-slate-600">
                      <svg class="h-5 w-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      {{ reason }}
                    </li>
                  }
                </ul>
              </div>
            </div>
          }

          <!-- Risk & Staging Preview (Step 2/3) -->
          @if (step() >= 2 && step() <= 4) {
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
               <div class="bg-slate-800 text-white p-4 border-b">
                 <h3 class="font-bold">Estimated Staging & Risk</h3>
               </div>
               <div class="p-4 space-y-4">
                  <div>
                     <div class="text-xs uppercase text-slate-500 font-bold">AJCC 8th Edition</div>
                     <div class="text-xl font-bold text-indigo-600">{{ ajccStage().stage }}</div>
                     <div class="text-xs text-slate-400">T:{{ajccStage().t}} N:{{ajccStage().n}} M:{{ajccStage().m}}</div>
                  </div>
                  <div class="border-t pt-4">
                     <div class="text-xs uppercase text-slate-500 font-bold">ATA 2025 Risk</div>
                     <div class="text-xl font-bold" [class.text-red-600]="riskData().risk.includes('High')" [class.text-green-600]="riskData().risk.includes('Low')">{{ riskData().risk }}</div>
                     <div class="text-xs text-slate-500">{{ riskData().description }}</div>
                  </div>
               </div>
            </div>
          }

          <!-- Management Plan (Step 4) -->
          @if (step() === 4) {
             <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
               <h3 class="font-bold text-slate-900 mb-2">Comorbidity Check</h3>
               <p class="text-sm text-slate-600">Checking osteoporosis and cardiac status allows for personalized TSH goals to minimize toxicity.</p>
             </div>
          }

          <!-- Complications Guidance (Step 5) -->
          @if (step() === 5) {
            <div class="space-y-4">
              @for (item of complicationManagement(); track item.issue) {
                <div [class]="item.color + ' rounded-xl shadow-sm p-5'">
                  <h4 class="font-bold text-slate-900">{{ item.issue }}</h4>
                  <p class="text-sm text-slate-700 mt-2">{{ item.advice }}</p>
                </div>
              }
            </div>
          }

          <!-- Response (Step 6) -->
          @if (step() === 6) {
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div [class]="responseAssessment().color + ' p-4 border-b'">
                 <h3 class="font-bold text-lg">Response to Therapy</h3>
              </div>
              <div class="p-6">
                 <div class="text-2xl font-bold text-slate-900 mb-1">{{ responseAssessment().response }}</div>
                 <p class="text-slate-500 text-sm mb-4">{{ responseAssessment().description }}</p>
                 <div class="bg-slate-50 p-3 rounded text-sm text-slate-700">{{ responseAssessment().action }}</div>
              </div>
            </div>
          }
        </div>
      }

      <!-- FINAL REPORT VIEW (Step 8) - FULL WIDTH -->
      @if (step() === 8) {
        <div class="col-span-12">
          
          <div class="flex justify-between items-center mb-6 print:hidden">
             <button (click)="goToStep(7)" class="text-slate-600 hover:text-slate-900 font-medium">← Back to Guidance</button>
             <button (click)="printReport()" class="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
               </svg>
               Print / Save PDF
             </button>
          </div>

          <div class="bg-white shadow-2xl print:shadow-none max-w-4xl mx-auto p-8 md:p-12 print:p-0" id="print-area">
             
             <!-- Report Header -->
             <div class="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
               <div>
                 <h1 class="text-3xl font-bold text-slate-900">Thyroid Cancer Clinical Assessment</h1>
                 <p class="text-slate-500 mt-1">Generated via ATA 2025 Companion</p>
               </div>
               <div class="text-right text-sm">
                 <div>Date: {{ today | date:'mediumDate' }}</div>
                 <div class="text-slate-400 text-xs mt-1">Dr. Vardhan Kumar Reddy</div>
               </div>
             </div>

             <!-- Demographics Grid -->
             <div class="grid grid-cols-2 gap-8 mb-8">
               <div>
                 <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Demographics</h3>
                 <div class="text-slate-900"><span class="font-semibold">Name/ID:</span> {{ form.value.name || 'Not specified' }}</div>
                 <div class="text-slate-900"><span class="font-semibold">Age/Sex:</span> {{ form.value.age }} / {{ form.value.sex }}</div>
                 <div class="text-slate-900 mt-2"><span class="font-semibold">Comorbidities:</span> 
                    {{ form.value.comorbidities.osteoporosis ? 'Osteoporosis, ' : '' }}
                    {{ form.value.comorbidities.atrialFib ? 'Atrial Fib, ' : '' }}
                    {{ !form.value.comorbidities.osteoporosis && !form.value.comorbidities.atrialFib ? 'None Listed' : '' }}
                 </div>
               </div>
               <div>
                 <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tumor Summary</h3>
                 <div class="text-slate-900">{{ form.value.tumorType }} ({{ form.value.subtype }})</div>
                 <div class="text-slate-900">Size: {{ form.value.pathologicalSize }} cm</div>
                 <div class="text-slate-900">Multifocal: {{ form.value.multifocality ? 'Yes' : 'No' }}</div>
                 <div class="text-slate-900">Capsular Invasion: {{ form.value.capsularInvasion ? 'Yes' : 'No' }}</div>
               </div>
             </div>

             <!-- Staging & Risk Table -->
             <div class="mb-8 border rounded-lg overflow-hidden">
               <div class="bg-slate-100 px-4 py-2 font-bold text-slate-700 border-b">Staging & Risk Stratification</div>
               <div class="grid grid-cols-2 divide-x">
                 <div class="p-4">
                    <div class="text-sm text-slate-500">AJCC 8th Edition</div>
                    <div class="text-2xl font-bold text-slate-900">{{ ajccStage().stage }}</div>
                    <div class="text-sm font-mono mt-1">T:{{ajccStage().t}} N:{{ajccStage().n}} M:{{ajccStage().m}}</div>
                 </div>
                 <div class="p-4 bg-slate-50">
                    <div class="text-sm text-slate-500">ATA 2025 Risk Group</div>
                    <div class="text-xl font-bold text-slate-900">{{ riskData().risk }}</div>
                    <ul class="mt-2 text-sm list-disc list-inside text-slate-700">
                      @for (r of riskData().reasoning; track r) {
                        <li>{{r}}</li>
                      }
                    </ul>
                 </div>
               </div>
             </div>

             <!-- Complications Summary -->
             @let cm = complicationManagement();
             @if (cm.length > 0 && cm[0].issue !== 'No Major Complications') {
               <div class="mb-8 bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h3 class="text-sm font-bold text-orange-900 mb-2 uppercase tracking-wide">Post-Operative Complications</h3>
                  <ul class="space-y-2">
                     @for (c of cm; track c.issue) {
                       <li class="text-sm text-orange-800">
                          <span class="font-bold">{{ c.issue }}:</span> {{ c.advice }}
                       </li>
                     }
                  </ul>
               </div>
             }

             <!-- Management Plan -->
             <div class="mb-8">
               <h3 class="text-lg font-bold text-slate-800 mb-3 border-b pb-1">Management Recommendations</h3>
               <div class="grid grid-cols-2 gap-6">
                  <div>
                     <div class="font-bold text-indigo-900">RAI Therapy</div>
                     <div class="text-lg">{{ managementPlan().rai.rec }}</div>
                     <div class="text-sm text-slate-600 mt-1">{{ managementPlan().rai.rationale }}</div>
                     @if (managementPlan().rai.dose !== 'N/A') {
                       <div class="text-sm mt-2">
                         <span class="font-semibold">Dose:</span> {{managementPlan().rai.dose}}<br>
                         <span class="font-semibold">Prep:</span> {{managementPlan().rai.prep}}
                       </div>
                     }
                  </div>
                  <div>
                     <div class="font-bold text-teal-900">TSH Goal</div>
                     <div class="text-lg">{{ managementPlan().tsh.target }}</div>
                     <div class="text-sm text-slate-600 mt-1">{{ managementPlan().tsh.rationale }}</div>
                  </div>
               </div>
             </div>

             <!-- Surveillance Status -->
             <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
               <h3 class="text-lg font-bold text-slate-800 mb-3">Current Surveillance Status</h3>
               <div class="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span class="block text-slate-500">Tg (Suppressed)</span>
                    <span class="font-bold">{{ form.value.tgSuppressed }} ng/mL</span>
                  </div>
                  <div>
                    <span class="block text-slate-500">TgAb Status</span>
                    <span class="font-bold">{{ form.value.tgAbStatus }}</span>
                  </div>
                  <div>
                    <span class="block text-slate-500">Imaging</span>
                    <span class="font-bold">{{ form.value.imagingUS }}</span>
                  </div>
               </div>
               <div class="border-t border-gray-200 pt-3">
                  <div class="flex items-center">
                    <span class="text-slate-500 mr-2">Response Assessment:</span>
                    <span class="font-bold text-lg" [class]="responseAssessment().color.replace('bg-', 'text-').split(' ')[1]">{{ responseAssessment().response }}</span>
                  </div>
                  <div class="text-slate-700 mt-1 italic">{{ responseAssessment().action }}</div>
               </div>
             </div>

             <!-- Disclaimer Footer -->
             <div class="mt-12 text-xs text-slate-400 border-t pt-4 text-center">
               Generated by ATA 2025 Companion App (Dev: Dr. Vardhan Kumar Reddy). This report is a decision support aid and does not replace professional clinical judgment.
             </div>

          </div>
        </div>
      }

    </div>
  </main>
</div>
`
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
