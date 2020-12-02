cwlVersion: v1.0
class: Workflow
hints:
  ResourceRequirement:
    coresMin: 6
    coresMax: 6
    ramMin: 4GB
    ramMax: 4GB
    tmpdirMin: 3000
inputs:
  tarFile: File
  source: string
  reference: string

outputs:
  copynumber:
    type: File
    outputSource: process_ashion/copynumber
  expression:
    type: File
    outputSource: process_ashion/expression
  tmp:
    type: File
    outputSource: process_ashion/tmp
  germline_bam:
    type: File
    outputSource: process_ashion/germline_bam
  germline_bam_index:
    type: File
    outputSource: process_ashion/germline_bam_index
  germline_bam_header:
    type: File
    outputSource: process_ashion/germline_bam_header
  germline_vcf:
    type: File
    outputSource: process_ashion/germline_vcf
  pdf:
    type: File
    outputSource: process_ashion/pdf
  rna_bam:
    type: File
    outputSource: process_ashion/rna_bam
  rna_bam_index:
    type: File
    outputSource: process_ashion/rna_bam_index
  rna_bam_header:
    type: File
    outputSource: process_ashion/rna_bam_header
  somatic_bam:
    type: File
    outputSource: process_ashion/somatic_bam
  somatic_bam_index:
    type: File
    outputSource: process_ashion/somatic_bam_index
  somatic_bam_header:
    type: File
    outputSource: process_ashion/somatic_bam_header
  somatic_vcf:
    type: File
    outputSource: process_ashion/somatic_vcf
  structural:
    type: File
    outputSource: process_ashion/structural
  normalized_somatic_vcf:
    type: File
    outputSource: normalize_somatic_vcf/normalized_somatic_vcf
  normalized_germline_vcf:
    type: File
    outputSource: normalize_germline_vcf/normalized_germline_vcf
  pcann:
    type: File
    outputSource: pcann/prediction_json
  cancerscope:
    type: File
    outputSource: cancerscope/prediction_json
  yml:
    type: File
    outputSource: generate_yml/yml

steps:
  process_ashion:
    in:
      tarFile: tarFile
      source: source
    out:
      [copynumber, expression, tmp, germline_bam, germline_bam_index, germline_bam_header, germline_vcf, pdf, rna_bam, rna_bam_index, rna_bam_header, somatic_bam, somatic_bam_index, somatic_bam_header, somatic_vcf, structural]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/ashion-ingest:3.4.0
      baseCommand: ga4gh
      arguments: ["--output", "/tmp"]
      inputs:
        tarFile:
          type: File
          inputBinding:
            prefix: --input
            position: 1
        source:
          type: string
          inputBinding:
            prefix: --source
            position: 2
      outputs:
        copynumber:
          type: File
          outputBinding:
            glob: '/tmp/**/*.copynumber.csv'
        expression:
          type: File
          outputBinding:
            glob: '/tmp/**/*.expression.rgel.gz'
        tmp:
          type: File
          outputBinding:
            glob: '/tmp/**/*.ga4gh.tmp'
        germline_bam:
          type: File
          outputBinding:
            glob: '/tmp/**/*.germline.bam'
        germline_bam_index:
          type: File
          outputBinding:
            glob: '/tmp/**/*.germline.bam.bai'
        germline_bam_header:
          type: File
          outputBinding:
            glob: '/tmp/**/*.germline.bam.header.bam'
        germline_vcf:
          type: File
          outputBinding:
            glob: '/tmp/**/*.germline.vcf.gz'
        pdf:
          type: File
          outputBinding:
            glob: '/tmp/**/*.pdf'
        rna_bam:
          type: File
          outputBinding:
            glob: '/tmp/**/*.rna.bam'
        rna_bam_index:
          type: File
          outputBinding:
            glob: '/tmp/**/*.rna.bam.bai'
        rna_bam_header:
          type: File
          outputBinding:
            glob: '/tmp/**/*.rna.bam.header.bam'
        somatic_bam:
          type: File
          outputBinding:
            glob: '/tmp/**/*.somatic.bam'
        somatic_bam_index:
          type: File
          outputBinding:
            glob: '/tmp/**/*.somatic.bam.bai'
        somatic_bam_header:
          type: File
          outputBinding:
            glob: '/tmp/**/*.somatic.bam.header.bam'
        somatic_vcf:
          type: File
          outputBinding:
            glob: '/tmp/**/*.somatic.vcf.gz'
        structural:
          type: File
          outputBinding:
            glob: '/tmp/**/*.structural.csv'
  pcann:
    in:
      rgel:
        source: process_ashion/expression
    out:
      [prediction_json]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/kopis-pcann-tumororigin:1.0.0
      arguments: ["TSOpredict"]
      inputs:
        rgel:
          type: File
          inputBinding:
            prefix: --input
            position: 1
      outputs:
        prediction_json:
          type: File
          outputBinding:
            glob: '/tmp/**/*.pcann.json'
  cancerscope:
    in:
      rgel:
        source: process_ashion/expression
    out:
      [prediction_json]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/cancerscope:1.1.1
      inputs:
        rgel:
          type: File
          inputBinding:
            prefix: --input
            position: 1
      outputs:
        prediction_json:
          type: File
          outputBinding:
            glob: '/tmp/**/*.cancerscope.json'
  normalize_somatic_vcf:
    in:
      vcf:
        source: process_ashion/somatic_vcf
      LIFEOMIC_GENOME_REFERENCE: reference
    out:
      [normalized_somatic_vcf]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/kopis-task-vtools:1.1.0
      arguments: ["vt-combo", "-r", "/tmp/reference/GRCh37.fa.gz", "-c", "-p"]
      inputs:
        vcf:
          type: File
          inputBinding:
            prefix: -i
            position: 1
        LIFEOMIC_GENOME_REFERENCE:
          type: string
      outputs:
        normalized_somatic_vcf:
          type: File
          outputBinding:
            glob: '/tmp/**/*.nrm.vcf.gz'
  normalize_germline_vcf:
    in:
      vcf:
        source: process_ashion/germline_vcf
      LIFEOMIC_GENOME_REFERENCE: reference
    out:
      [normalized_germline_vcf]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/kopis-task-vtools:1.1.0
      arguments: ["vt-combo", "-r", "/tmp/reference/GRCh37.fa.gz", "-c", "-p"]
      inputs:
        vcf:
          type: File
          inputBinding:
            prefix: -i
            position: 1
        LIFEOMIC_GENOME_REFERENCE:
          type: string
      outputs:
        normalized_germline_vcf:
          type: File
          outputBinding:
            glob: '/tmp/**/*.nrm.vcf.gz'
  generate_yml:
    in:
      nrm_germline_vcf:
        source: normalize_germline_vcf/normalized_germline_vcf
      normalize_somatic_vcf:
        source: normalize_somatic_vcf/normalized_somatic_vcf
      pcann_prediction_json:
        source: pcann/prediction_json
      cancerscope_prediction_json:
        source: cancerscope/prediction_json
      yml_tmp:
        source: process_ashion/tmp
    out:
      [yml]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/ashion-ingest:3.4.0
      baseCommand: yml
      inputs:
        nrm_germline_vcf:
          type: File
        normalize_somatic_vcf:
          type: File
        yml_tmp:
          type: File
          inputBinding:
            prefix: --input
            position: 1
        pcann_prediction_json:
          type: File
          inputBinding:
            prefix: --pcann
            position: 2
        cancerscope_prediction_json:
          type: File
          inputBinding:
            prefix: --cancerscope
            position: 2
      outputs:
         yml:
          type: File
          outputBinding:
            glob: '/tmp/**/*.ga4gh.yml'

s:license: https://opensource.org/licenses/MIT
s:author:
  - class: s:Organization
    s:email: phc-clinical-research@lifeomic.com
    s:name: LifeOmic Clinical Research Team

$namespaces:
 s: https://schema.org/

$schemas:
 - https://schema.org/version/latest/schemaorg-current-http.rdf

doc: |
  Workflow that converts an Ashion .tar test file into omics files to be
  ingested into the LifeOmic Precision Health Cloud (https://lifeomic.com/products/precision-health-cloud/).