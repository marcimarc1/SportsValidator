import api from "../api/api";

class AnnotationController {
    static prefix = 'annotation';

    static async saveChanges(annotationData) {
        return api.post(`/${this.prefix}/SaveChanges`, annotationData, {
            headers: {
                "Content-Type": "application/json"
            }
    });}
}

export default AnnotationController;