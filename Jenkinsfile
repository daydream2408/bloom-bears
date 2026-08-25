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
                echo 'Installing Backend dependencies...'
                dir('backend') {
                    sh 'npm install'
                }
                echo 'Installing Frontend dependencies...'
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Storefront') {
            steps {
                echo 'Building React production assets...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running pipeline tests...'
                // sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Add custom deployment scripts (e.g. pm2 reload, docker-compose build)
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
