#!groovy

pipeline {
  agent none

  stages {
    stage('build and security scan') {
      parallel {
        stage('build and test') {
          agent { label 'ecs-builder' }
          steps {
            initBuild()
            sh 'yarn'
            sh 'yarn build'
            sh 'lifeomic-build'
            sh 'yarn jenkins-test'
          }
          post {
            always {
                archive 'target/*.xml'
                junit 'target/*.xml'
            }
          }
        }

        stage('security scan') {
          agent { label 'ecs-builder' }
          steps {
            initBuild()
            sh 'yarn install'
            securityScan()
          }
        }
      }
    }
  }
}
