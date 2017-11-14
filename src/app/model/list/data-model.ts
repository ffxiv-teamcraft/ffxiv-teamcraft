export class DataModel {
    $key: string;

    getData(): object {
        return JSON.parse(JSON.stringify(this));
    }
}
