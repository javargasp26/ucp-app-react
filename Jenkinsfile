pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Nombre definido en Administrar Jenkins > Tools
    }

    environment {
        SONAR_PROJECT_KEY  = 'ucp-app-react'
        SONAR_PROJECT_NAME = 'UCP React App'
    }

    stages {
        // Etapa 1: Checkout del código desde GitHub
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/javargasp26/ucp-app-react.git'
            }
        }

        // Etapa 2: Instalar dependencias y build del proyecto
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        // Etapa 3: Pruebas unitarias con reporte JUnit y cobertura (lcov)
        stage('Pruebas Unitarias') {
            steps {
                sh 'npm test -- --watchAll=false --ci --coverage --reporters=default --reporters=jest-junit'
            }
            post {
                always {
                    junit 'junit.xml'
                    archiveArtifacts artifacts: 'junit.xml', allowEmptyArchive: true
                }
            }
        }

        // Etapa 4: Análisis estático con SonarQube
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.projectName='${SONAR_PROJECT_NAME}' \
                              -Dsonar.sources=src \
                              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        // Etapa 5: Esperar el resultado del Quality Gate
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
                // Etapa 6: Análisis de seguridad de dependencias con Snyk
        stage('Security Scan with Snyk') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'SNYK_API_TOKEN', variable: 'SNYK_TOKEN')]) {
                        // Instalar el CLI de Snyk y el generador de reporte HTML
                        sh 'npm install -g snyk snyk-to-html'

                        // Escaneo: 0 = sin vulnerabilidades altas/críticas, 1 = encontró, 2+ = error
                        def rc = sh(
                            script: 'snyk test --all-projects --severity-threshold=high --json-file-output=snyk_results.json',
                            returnStatus: true
                        )

                        // Reporte HTML y registro del proyecto en el dashboard de Snyk
                        sh 'snyk-to-html -i snyk_results.json -o snyk_report.html || true'
                        sh 'snyk monitor --all-projects || true'

                        publishHTML target: [
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: '.',
                            reportFiles: 'snyk_report.html',
                            reportName: 'Snyk Security Report'
                        ]

                        if (rc == 1) {
                            echo 'Snyk encontró vulnerabilidades altas o críticas. Build marcado como UNSTABLE.'
                            currentBuild.result = 'UNSTABLE'
                        } else if (rc > 1) {
                            echo "Snyk no pudo completar el escaneo (código ${rc})."
                            currentBuild.result = 'UNSTABLE'
                        } else {
                            echo 'Snyk: sin vulnerabilidades altas o críticas.'
                        }
                    }
                }
            }
        }
    }

    // Post-actions
    post {
        success {
            echo '¡Pipeline ejecutado con éxito!'
        }
        failure {
            echo 'Pipeline fallido. Revisar logs.'
        }
        always {
            emailext(
                subject: "Pipeline ${currentBuild.currentResult}: ucp-app-react #${env.BUILD_NUMBER}",
                body: """
                    Estado: ${currentBuild.currentResult}
                    URL Build: ${env.BUILD_URL}
                    Detalles de Pruebas: ${env.BUILD_URL}testReport/
                    SonarQube: http://localhost:9000/dashboard?id=ucp-app-react
                """,
                to: 'javargasp26@gmail.com'
            )
        }
    }
}
