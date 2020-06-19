cwlVersion: v1.0
class: CommandLineTool
id: ashion-ingest
label: ashion-ingest
hints:
  DockerRequirement:
    dockerPull: lifeomic/ashion-ingest:3.1.1
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