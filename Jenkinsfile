pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        echo 'Installing Backend dependencies...'
                        dir('backend') { sh 'npm install' }
                        echo 'Installing Frontend dependencies...'
                        dir('frontend') { sh 'npm install' }
                    } else {
                        echo 'Installing Backend dependencies (Windows)...'
                        dir('backend') { bat 'npm install' }
                        echo 'Installing Frontend dependencies (Windows)...'
                        dir('frontend') { bat 'npm install' }
                    }
                }
            }
        }

        stage('Build Storefront') {
            steps {
                script {
                    if (isUnix()) {
                        echo 'Building React production assets...'
                        dir('frontend') { sh 'npm run build' }
                    } else {
                        echo 'Building React production assets (Windows)...'
                        dir('frontend') { bat 'npm run build' }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running pipeline tests...'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please inspect logs.'
        }
    }
}
