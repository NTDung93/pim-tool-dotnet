import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private savedSearchText!: String;
  private savedSatus!: String;
  private isUpdate: boolean = false;

  constructor() {}

  setSavedSearchText(value: String) {
    this.savedSearchText = value;
  }

  getSavedSearchText(): String {
    return this.savedSearchText;
  }

  setSavedSatus(value: String) {
    this.savedSatus = value;
  }

  getSavedSatus(): String {
    return this.savedSatus;
  }

  setIsUpdate(value: boolean) {
    this.isUpdate = value;
  }

  getIsUpdate(): boolean {
    return this.isUpdate;
  }
}
