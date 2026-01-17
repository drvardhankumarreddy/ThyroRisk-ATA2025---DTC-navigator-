
import { Injectable } from '@angular/core';

// --- Clinical / Pre-Op Types ---
export type ClinicalNodes = 'cN0' | 'cN1a' | 'cN1b';
export type ClinicalETE = 'None' | 'Gross (Strap Muscles)' | 'Gross (Major Structures)';

// --- Pathological / Post-Op Types ---
export type TumorType = 'PTC' | 'FTC' | 'OTC' | 'NIFTP';
export type HistologySubtype = 'Classical' | 'Follicular Variant' | 'Tall Cell' | 'Hobnail' | 'Columnar' | 'Diffuse Sclerosing' | 'Solid' | 'Widely Invasive FTC/OTC';
export type PathologicalETE = 'None' | 'Microscopic' | 'Gross (Strap Muscles)' | 'Gross (Major Structures)';
export type PathologicalNodes = 'Nx' | 'N0' | 'N1a' | 'N1b';
export type DistantMets = 'M0' | 'M1';

// --- Molecular Types ---
export interface MolecularProfile {
  status: 'Unknown' | 'Tested';
  braf?: boolean;
  tert?: boolean;
  ras?: boolean;
  tp53?: boolean;
  fusion?: boolean; 
}

// --- Surveillance / Labs ---
export type TgAbStatus = 'Negative' | 'Positive (Stable/Declining)' | 'Positive (Rising)';
export type ImagingStatus = 'Negative' | 'Nonspecific/Indeterminate' | 'Structural Disease Identified';

// --- Complications ---
export interface ComplicationsProfile {
  hypoparathyroidism: 'None' | 'Transient' | 'Permanent';
  vocalCordPalsy: 'None' | 'Transient' | 'Permanent';
  hematoma: boolean;
  infection: boolean;
  chyleLeak: boolean;
}

export interface PatientCase {
  // Step 1: Demographics & Clinical
  name?: string;
  sex: 'Male' | 'Female';
  age: number;
  clinicalSize: number; 
  clinicalNodes: ClinicalNodes;
  clinicalETE: ClinicalETE;
  contralateralNodules: boolean;
  priorRadiation: boolean;
  comorbidities: {
    osteoporosis: boolean;
    atrialFib: boolean;
    advancedAge: boolean; // >60
  };
  
  // Step 2: Post-Op Pathology
  tumorType: TumorType;
  subtype: HistologySubtype;
  pathologicalSize: number; 
  multifocality: boolean;
  capsularInvasion: boolean;
  pathologicalETE: PathologicalETE;
  pathologicalNodes: PathologicalNodes;
  
  nodeSize?: number; 
  numPosNodes?: number;
  ene?: boolean; 

  vascularInvasion?: number; 
  marginsPositive?: boolean;

  distantMets: DistantMets;

  molecular: MolecularProfile;

  // Step 5: Complications
  complications: ComplicationsProfile;

  // Step 6: Surveillance / Labs
  tgSuppressed: number; // ng/mL
  tgStimulated: number; // ng/mL (optional)
  tshValue: number; // mIU/L
  tgAbStatus: TgAbStatus;
  
  imagingUS: 'Negative' | 'Suspicious Nodes' | 'Thyroid Bed Recurrence';
  imagingRAI: 'Not Done' | 'No Uptake' | 'Thyroid Bed Uptake' | 'Distant Uptake';
  imagingCrossSectional: 'Not Done' | 'Negative' | 'Structural Disease';
}

@Injectable({
  providedIn: 'root'
})
export class GuidelinesService {

  /**
   * AJCC 8th Edition Staging Calculation
   */
  getAJCCStage(data: PatientCase): { stage: string; t: string; n: string; m: string; description: string } {
    let t = 'Tx';
    let n = 'Nx';
    let m = data.distantMets === 'M1' ? 'M1' : 'M0';

    // Calculate T-Stage
    if (data.pathologicalETE === 'Gross (Major Structures)') {
      t = 'T4a/b'; // Simplified for app logic, usually T4a is resectable
    } else if (data.pathologicalETE === 'Gross (Strap Muscles)') {
      t = 'T3b';
    } else if (data.pathologicalSize > 4) {
      t = 'T3a';
    } else if (data.pathologicalSize > 2) {
      t = 'T2';
    } else {
      t = 'T1';
    }

    // Calculate N-Stage
    if (data.pathologicalNodes === 'N1b') n = 'N1b';
    else if (data.pathologicalNodes === 'N1a') n = 'N1a';
    else if (data.pathologicalNodes === 'N0') n = 'N0';
    else n = 'Nx';

    let stage = 'Unknown';
    
    // Staging Logic (DTC)
    if (data.age < 55) {
      if (m === 'M1') stage = 'Stage II';
      else stage = 'Stage I';
    } else {
      // Age >= 55
      if (m === 'M1') {
        stage = 'Stage IVB';
      } else if (t.includes('T4')) {
        stage = 'Stage IVA'; // T4a is IVA, T4b is IVB (assuming 4a for gross major)
        if (data.pathologicalETE === 'Gross (Major Structures)') stage = 'Stage IVA (or IVB if prevertebral)';
      } else if (n === 'N1a' || n === 'N1b') {
        stage = 'Stage II';
      } else if (t === 'T3a' || t === 'T3b') {
        stage = 'Stage II';
      } else {
        // T1 or T2, N0/Nx, M0
        stage = 'Stage I';
      }
    }

    return {
      stage, t, n, m,
      description: `Age ${data.age}, ${t}, ${n}, ${m}`
    };
  }

  getSurgicalRecommendation(data: PatientCase): { 
    procedure: string; 
    considerations: string[]; 
    level: string;
    color: string;
  } {
    const size = data.clinicalSize;
    const cN = data.clinicalNodes;
    const cETE = data.clinicalETE;

    if (size > 4 || cN !== 'cN0' || cETE !== 'None' || data.priorRadiation || data.distantMets === 'M1') {
      return {
        procedure: 'Total Thyroidectomy',
        considerations: [
          'Tumor > 4cm',
          'Clinical N1 disease (Central or Lateral)',
          'Gross Extrathyroidal Extension suspected',
          'History of head/neck radiation'
        ].filter(Boolean),
        level: 'Strong Recommendation (Rec 15C)',
        color: 'bg-red-50 border-red-200 text-red-800'
      };
    }

    if (size >= 1 && size <= 4) {
      if (data.contralateralNodules) {
        return {
          procedure: 'Total Thyroidectomy (Preferred)',
          considerations: [
            'Bilateral nodular disease present',
            'Facilitates RAI if high-risk pathology is found'
          ],
          level: 'Conditional Recommendation (Rec 15B)',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      }
      return {
        procedure: 'Lobectomy OR Total Thyroidectomy',
        considerations: [
          'Lobectomy: Lower risk of hypoparathyroidism/nerve injury.',
          'Total: Preferred if planning for RAI or follow-up with Tg.',
          'Patient preference plays a major role.'
        ],
        level: 'Conditional Recommendation (Rec 15B)',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      };
    }

    if (size < 1) {
      return {
        procedure: 'Thyroid Lobectomy',
        considerations: [
          'Sufficient for unifocal intrathyroidal microcarcinoma',
          'Active Surveillance is also an alternative for selected patients (Rec 13)'
        ],
        level: 'Strong Recommendation (Rec 15A)',
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    }

    return { procedure: 'Clinical Judgment', considerations: [], level: 'N/A', color: 'bg-gray-50' };
  }

  getRiskStratification(data: PatientCase): { risk: string; description: string; color: string; reasoning: string[] } {
    const reasons: string[] = [];
    let isHigh = false;
    
    if (data.pathologicalETE.includes('Gross') || data.marginsPositive) { isHigh = true; reasons.push('Gross ETE or incomplete resection'); }
    if (data.distantMets === 'M1') { isHigh = true; reasons.push('Distant metastases'); }
    if (data.molecular.status === 'Tested') {
      if (data.molecular.tert && (data.molecular.braf || data.molecular.ras)) { isHigh = true; reasons.push('Genetic High Risk: TERT + BRAF/RAS'); }
      if (data.molecular.tp53) { isHigh = true; reasons.push('Genetic High Risk: TP53'); }
    }
    if (data.tumorType === 'FTC' && (data.vascularInvasion || 0) > 4) { isHigh = true; reasons.push('Extensive vascular invasion (>4 vessels)'); }
    if (data.pathologicalNodes === 'N1b' && (data.nodeSize || 0) > 3) { isHigh = true; reasons.push('Large volume N1b disease (>3cm)'); }

    if (isHigh) return { risk: 'High Risk', description: 'Risk of structural recurrence > 30%', color: 'bg-red-100 text-red-900 border-red-300', reasoning: reasons };

    let isIntHigh = false;
    if (data.pathologicalNodes === 'N1b' || (data.pathologicalNodes === 'N1a' && ((data.nodeSize || 0) >= 3 || data.ene))) { isIntHigh = true; reasons.push('Clinical N1, N1b, or N1a with ENE/large size'); }
    if (['Tall Cell', 'Hobnail', 'Columnar', 'Diffuse Sclerosing', 'Solid'].includes(data.subtype)) { isIntHigh = true; reasons.push(`Aggressive Histology: ${data.subtype}`); }
    if (data.molecular.status === 'Tested' && data.molecular.tert && !data.molecular.braf && !data.molecular.ras) { isIntHigh = true; reasons.push('TERT promoter mutation alone'); }

    if (isIntHigh) return { risk: 'Intermediate-High Risk', description: 'Risk of structural recurrence ~20-30%', color: 'bg-orange-100 text-orange-900 border-orange-300', reasoning: reasons };

    let isIntLow = false;
    if (data.pathologicalETE === 'Microscopic') { isIntLow = true; reasons.push('Microscopic ETE'); }
    if (data.pathologicalNodes === 'N1a' && (data.nodeSize || 0) < 3 && !data.ene) { isIntLow = true; reasons.push('Low volume N1a'); }
    if (data.molecular.status === 'Tested' && data.molecular.braf && !data.molecular.tert) { isIntLow = true; reasons.push('BRAF V600E alone'); }
    if (data.tumorType === 'FTC' && (data.vascularInvasion || 0) < 4 && (data.vascularInvasion || 0) > 0) { isIntLow = true; reasons.push('Minimally invasive FTC'); }

    if (isIntLow) return { risk: 'Intermediate-Low Risk', description: 'Risk of structural recurrence 10-20%', color: 'bg-yellow-100 text-yellow-900 border-yellow-300', reasoning: reasons };

    reasons.push('Intrathyroidal, N0/Nx, no aggressive histology');
    return { risk: 'Low Risk', description: 'Risk of structural recurrence < 5%', color: 'bg-green-100 text-green-900 border-green-300', reasoning: reasons };
  }

  getManagementPlan(riskProfile: {risk: string}, data: PatientCase): {
    rai: { rec: string; dose: string; rationale: string; prep: string };
    tsh: { target: string; rationale: string };
  } {
    const r = riskProfile.risk;
    const hasComorbidities = data.comorbidities.osteoporosis || data.comorbidities.atrialFib || data.comorbidities.advancedAge;
    
    let rai = { rec: 'Not Routinely Recommended', dose: 'N/A', rationale: 'Benefit likely negligible.', prep: 'N/A' };
    let tsh = { target: '0.5 - 2.0 mIU/L', rationale: 'Maintain low-normal TSH.' };

    if (r.includes('High')) {
      rai = {
        rec: 'Recommended',
        dose: '100-150 mCi',
        rationale: 'High risk of recurrence/mortality. Intent: Adjuvant or Therapeutic.',
        prep: 'Thyroid Hormone Withdrawal or rhTSH (Thyrogen).'
      };
      tsh = {
        target: hasComorbidities ? '0.1 - 0.5 mIU/L' : '< 0.1 mIU/L',
        rationale: hasComorbidities 
          ? 'Suppression moderated due to comorbidities (Bone/Heart health).' 
          : 'Strict suppression indicated for high-risk disease.'
      };
    } else if (r.includes('Intermediate-High')) {
      rai = {
        rec: 'Consider / Recommended',
        dose: '100 mCi',
        rationale: 'Favored for aggressive histology or significant nodal burden.',
        prep: 'rhTSH (Thyrogen) preferred for quality of life.'
      };
      tsh = {
        target: hasComorbidities ? '0.5 - 2.0 mIU/L' : '0.1 - 0.5 mIU/L',
        rationale: 'Mild suppression. Relax if comorbidities present.'
      };
    } else if (r.includes('Intermediate-Low')) {
      rai = {
        rec: 'Selectively Consider',
        dose: '30-75 mCi',
        rationale: 'May use for remnant ablation to facilitate follow-up.',
        prep: 'rhTSH (Thyrogen) preferred.'
      };
      tsh = {
        target: '0.5 - 2.0 mIU/L',
        rationale: 'Low normal range sufficient.'
      };
    }

    return { rai, tsh };
  }

  getComplicationManagement(data: PatientCase): { issue: string; advice: string; color: string }[] {
    const guidance: { issue: string; advice: string; color: string }[] = [];
    const c = data.complications;

    // Hypoparathyroidism
    if (c.hypoparathyroidism === 'Transient') {
      guidance.push({
        issue: 'Transient Hypoparathyroidism',
        advice: 'Initiate oral calcium carbonate (1-3g daily) ± Calcitriol (0.25-0.5mcg). Monitor serum calcium weekly. Wean gradually as parathyroid function recovers.',
        color: 'border-l-4 border-yellow-500 bg-yellow-50'
      });
    } else if (c.hypoparathyroidism === 'Permanent') {
      guidance.push({
        issue: 'Permanent Hypoparathyroidism',
        advice: 'Requires lifelong Calcium + Calcitriol supplementation. Goal: Maintain serum Calcium in low-normal range (8.0-8.5 mg/dL) to avoid hypercalciuria. Monitor urinary calcium and renal function periodically.',
        color: 'border-l-4 border-red-500 bg-red-50'
      });
    }

    // Nerve Injury
    if (c.vocalCordPalsy === 'Transient') {
      guidance.push({
        issue: 'Transient Vocal Cord Palsy',
        advice: 'Perform flexible laryngoscopy to confirm. Speech therapy referral for voice strengthening. Observe for 6-12 months for recovery.',
        color: 'border-l-4 border-orange-500 bg-orange-50'
      });
    } else if (c.vocalCordPalsy === 'Permanent') {
      guidance.push({
        issue: 'Permanent Vocal Cord Palsy',
        advice: 'Consider injection laryngoplasty (early) or thyroplasty (late) if significant dysphonia/aspiration exists. Monitor for aspiration pneumonia.',
        color: 'border-l-4 border-red-500 bg-red-50'
      });
    }

    // Chyle Leak
    if (c.chyleLeak) {
      guidance.push({
        issue: 'Chyle Leak',
        advice: 'Conservative management: Low-fat / MCT diet. Monitor drain output daily. If high output (>500ml/day), consider NPO/TPN or Octreotide. Surgical re-exploration if persistent.',
        color: 'border-l-4 border-blue-500 bg-blue-50'
      });
    }

    if (guidance.length === 0) {
      guidance.push({
        issue: 'No Major Complications',
        advice: 'Standard post-operative care. Monitor scar healing.',
        color: 'border-l-4 border-green-500 bg-green-50'
      });
    }

    return guidance;
  }

  getResponseAssessment(data: PatientCase): { response: string; description: string; action: string; color: string } {
    const imagingPositive = data.imagingUS.includes('Suspicious') || data.imagingUS.includes('Recurrence') || 
                            data.imagingRAI.includes('Uptake') || data.imagingCrossSectional === 'Structural Disease';
    
    if (imagingPositive) {
      return { response: 'Structural Incomplete', description: 'Structural disease identified on imaging.', action: 'Consider Surgery, RAI, or Systemic Tx. Keep TSH < 0.1.', color: 'bg-red-50 border-red-200 text-red-800' };
    }

    if (data.tgSuppressed >= 1.0 || (data.tgStimulated && data.tgStimulated >= 10) || data.tgAbStatus === 'Positive (Rising)') {
      return { response: 'Biochemical Incomplete', description: 'Abnormal Tg (Suppressed ≥1) or rising antibodies without structural disease.', action: 'Monitor closely. Evaluate for occult disease.', color: 'bg-orange-50 border-orange-200 text-orange-800' };
    }

    if ((data.tgSuppressed >= 0.2 && data.tgSuppressed < 1.0) || data.tgAbStatus === 'Positive (Stable/Declining)') {
      return { response: 'Indeterminate Response', description: 'Low level Tg (0.2-1.0) or stable antibodies.', action: 'Continue surveillance. Maintain stable TSH.', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
    }

    if (data.tgSuppressed < 0.2 && data.tgAbStatus === 'Negative' && !imagingPositive) {
      return { response: 'Excellent Response', description: 'No clinical, biochemical, or structural evidence of disease.', action: 'Decrease surveillance intensity. Relax TSH target.', color: 'bg-green-50 border-green-200 text-green-800' };
    }

    return { response: 'Unclassified', description: 'Incomplete data.', action: 'Review inputs.', color: 'bg-gray-50' };
  }

  getSurveillanceGuidance(data: PatientCase, responseRisk: {response: string}): {
    interpretation: string;
    actions: string[];
    imagingAdvice: string;
    tshAdvice: string;
  } {
    let interpretation = '';
    let actions: string[] = [];
    let imagingAdvice = '';
    let tshAdvice = '';

    switch (responseRisk.response) {
      case 'Excellent Response':
        interpretation = 'The patient has no clinical, biochemical, or structural evidence of disease. This category is associated with the lowest risk of recurrence (<1-4%) and disease-specific death.';
        actions = [
          'Decrease intensity of surveillance.',
          'Monitor Tg levels annually.',
          'Neck Ultrasound can be spaced out (e.g., every 12-24 months) or discontinued in very low risk cases after 5 years.'
        ];
        tshAdvice = 'TSH goal can be relaxed to the low normal range (0.5 – 2.0 mIU/L), significantly reducing the risk of osteoporosis and cardiac arrhythmias.';
        imagingAdvice = 'Routine diagnostic whole body scans (WBS) are NOT recommended.';
        break;

      case 'Biochemical Incomplete':
        interpretation = 'There is abnormal Thyroglobulin (Tg) or rising antibodies, but no localizable disease on standard imaging. Spontaneous resolution occurs in ~20% of patients, while ~20% may progress to structural disease.';
        actions = [
          'Monitor Tg and TgAb levels more frequently (e.g., every 6 months) to determine velocity.',
          'If Tg is rapidly rising (doubling time < 1 year), expand imaging (Neck CT/MRI, Chest CT, potentially PET/CT).',
          'Consider empirical RAI therapy only if Tg is rising significantly and imaging is negative (controversial).'
        ];
        tshAdvice = 'Maintain TSH suppression (0.1 – 0.5 mIU/L) to minimize stimulation of occult disease.';
        imagingAdvice = 'Ensure comprehensive neck ultrasound is performed by an expert. Consider cross-sectional imaging (CT Neck/Chest with contrast) to rule out macroscopic disease.';
        break;

      case 'Structural Incomplete':
        interpretation = 'Persistent or recurrent structural disease has been identified. Clinical management depends on the location, size, and rate of growth of the structural lesions.';
        actions = [
          'Multidisciplinary review recommended (Surgery, Nuclear Medicine, Endocrinology).',
          'Assess if lesions are surgically resectable (Surgery is preferred for neck disease).',
          'If non-resectable but RAI-avid: Therapeutic RAI.',
          'If RAI-refractory and progressive: Consider systemic therapy (TKI) or active surveillance for indolent small volume disease.'
        ];
        tshAdvice = 'Maintain strict TSH suppression (< 0.1 mIU/L) in the absence of contraindications.';
        imagingAdvice = 'Full staging required: CT Neck/Chest/Abd/Pelvis or PET/CT to quantify disease burden.';
        break;

      case 'Indeterminate Response':
        interpretation = 'Findings are non-specific: Tg is detectable but low (0.2-1.0), or antibodies are stable, or imaging shows nonspecific changes. The risk of structural recurrence is low (15-20%).';
        actions = [
          'Continue observation. Do not rush to intervene.',
          'Repeat Tg and Antibodies in 6-12 months.',
          'Monitor specific suspicious lymph nodes with serial ultrasound.'
        ];
        tshAdvice = 'TSH goal is typically 0.1 – 0.5 mIU/L, but can be individualized to 0.5 – 2.0 mIU/L for lower risk patients.';
        imagingAdvice = 'Surveillance Ultrasound of the neck in 6-12 months.';
        break;

      default:
        interpretation = 'Data is insufficient to classify response.';
        actions = ['Review all input data.'];
    }

    return { interpretation, actions, imagingAdvice, tshAdvice };
  }
}
