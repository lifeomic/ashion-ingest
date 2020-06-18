cwlVersion: v1.0
class: Workflow
hints:
  ResourceRequirement:
    coresMin: 1
    coresMax: 1
    ramMin: 3GB
    ramMax: 3GB
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
  germline_vcf:
    type: File
    outputSource: process_ashion/germline_vcf
  pdf:
    type: File
    outputSource: process_ashion/pdf
  rna_bam:
    type: File
    outputSource: process_ashion/rna_bam
  somatic_bam:
    type: File
    outputSource: process_ashion/somatic_bam
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
  yml:
    type: File
    outputSource: generate_yml/yml

steps:
  process_ashion:
    in:
      tarFile: tarFile
      source: source
    out:
      [copynumber, expression, tmp, germline_bam, germline_vcf, pdf, rna_bam, somatic_bam, somatic_vcf, structural]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/ashion-ingest:3.0.1
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
            glob: '/tmp/**/*.expression.rgel'
        tmp:
          type: File
          outputBinding:
            glob: '/tmp/**/*.ga4gh.tmp'
        germline_bam:
          type: File
          outputBinding:
            glob: '/tmp/**/*.germline.bam'
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
        somatic_bam:
          type: File
          outputBinding:
            glob: '/tmp/**/*.somatic.bam'
        somatic_vcf:
          type: File
          outputBinding:
            glob: '/tmp/**/*.somatic.vcf.gz'
        structural:
          type: File
          outputBinding:
            glob: '/tmp/**/*.structural.csv'
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
      yml_tmp:
        source: process_ashion/tmp
    out:
      [yml]
    run:
      class: CommandLineTool
      hints:
        DockerRequirement:
          dockerPull: lifeomic/tmp-to-yml-ingest:1.0.0
      inputs:
        nrm_germline_vcf:
          type: File
        normalize_somatic_vcf:
          type: File
        yml_tmp:
          type: File
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
 - https://schema.org/version/latest/schema.rdf

doc: |
  Workflow that converts an Ashion .tar test file into omics files to be
  ingested into the LifeOmic Precision Health Cloud (https://lifeomic.com/products/precision-health-cloud/).