export class FirebaseDataModel {
    $key: string;
    $value: any;

    getData(): object {
        const result = {};
        Object.keys(this).map(key => result[key] = this[key]);
        return result;
    }
}
