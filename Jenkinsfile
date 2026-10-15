pipeline {
    agent any

    environment {
        IMAGE = "ghcr.io/eyal4473-cpu/sample-nodejs:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Test') {
            steps {
                sh 'npm ci'
                sh 'npm test'
            }
        }

        stage('SAST') {
            steps {
                sh '''
                    python3 -m pip install --user semgrep
                    export PATH="$HOME/.local/bin:$PATH"
                    semgrep scan --config p/javascript --severity ERROR --error --metrics=off app.js
                '''
            }
        }

        stage('Dependency audit') {
            steps {
                sh 'npm audit --audit-level=critical'
            }
        }

        stage('Helm lint') {
            steps {
                sh 'helm lint chart/sample-nodejs'
                sh 'helm template sample chart/sample-nodejs > /dev/null'
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t "$IMAGE" .'
            }
        }

        stage('Scan image') {
            steps {
                sh 'trivy image --exit-code 1 --ignore-unfixed --severity HIGH,CRITICAL "$IMAGE"'
            }
        }

        stage('Push') {
            when expression { env.GIT_BRANCH == 'origin/main' }
            steps {
                withCredentials([string(credentialsId: 'ghcr-token', variable: 'GHCR_TOKEN')]) {
                    sh '''
                        echo "$GHCR_TOKEN" | docker login ghcr.io -u eyal4473-cpu --password-stdin
                        docker push "$IMAGE"
                    '''
                }
            }
        }
    }
}
