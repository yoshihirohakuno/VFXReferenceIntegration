export class CameraManager {
    constructor(videoElement) {
        this.videoElement = videoElement;
    }

    async start() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }

        const cleanup = () => {
             if (this.videoElement.srcObject) {
                 const tracks = this.videoElement.srcObject.getTracks();
                 tracks.forEach(track => track.stop());
             }
        }

        try {
            cleanup();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            this.videoElement.srcObject = stream;
            
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve(this.videoElement);
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }
}
