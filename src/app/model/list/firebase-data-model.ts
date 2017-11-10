export class FirebaseDataModel {
    $key: string;
    $value: any;

    getData(): object {
        return JSON.parse(JSON.stringify(this));
    }
}
