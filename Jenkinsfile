pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Nombre definido en Administrar Jenkins > Tools
    }
    // Definición de pasos stages
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
                sh 'npm run build' // Ejecuta el build de React
            }
        }

        // Etapa 3: Ejecutar pruebas unitarias con reporte JUnit
        stage('Pruebas Unitarias') {
            steps {
                sh 'npm test -- --watchAll=false --ci --reporters=default --reporters=jest-junit'
            }
            post {
                always {
                    junit 'junit.xml' // Publica el reporte en Jenkins (pestaña Test Result)
                    archiveArtifacts artifacts: 'junit.xml', allowEmptyArchive: true
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
                """,
                to: 'javargasp26@gmail.com'
            )
        }
    }
}
