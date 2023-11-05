import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Project, Status } from 'src/app/model/project';
import { ProjectService } from 'src/app/service/project.service';
import { SharedService } from 'src/app/service/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from 'angular-toastify';

@Component({
  selector: '.list-project',
  templateUrl: './list-project.component.html',
  styleUrls: ['./list-project.component.scss'],
})
export class ListProjectComponent implements OnInit {
  public projects: Project[] = [];
  public deleteProjectId!: number;
  protected readonly Status = Status;
  projectsArr: Project[] = []; // Your projects array
  savedSearchText: any;
  savedStatus: String = '';

  selectedItems: Project[] = [];
  page = 1;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private sharedService: SharedService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.savedSearchText = this.sharedService.getSavedSearchText();
    this.savedStatus = this.sharedService.getSavedSatus();
    if (this.savedSearchText == '' && this.savedStatus == '') {
      this.getProjects();
    }

    if (this.savedSearchText != undefined || this.savedStatus != undefined) {
      console.log(this.savedSearchText);
      console.log(this.savedStatus);
      this.searchProjects2(this.savedSearchText, this.savedStatus);
    } else {
      this.getProjects();
    }
  }

  public getProjects(): void {
    this.projectService.getProjects().subscribe(
      (response: Project[]) => {
        console.log(response);

        this.projects = response;
        this.projects.sort((a, b) => a.projectNumber - b.projectNumber);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public searchProjects2(searchText: any, status: any) {
    if (searchText == '' && status == '') {
      return;
    }

    this.projectService
      .searchProjects(
        searchText == '' ? null : searchText,
        status == '' ? null : status
      )
      .subscribe(
        (response: Project[]) => {
          console.log('day la search');
          console.log(response);
          this.projects = response;
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
  }

  public searchProjects(searchForm: NgForm): void {
    if ((searchForm.value.searchText == '' && searchForm.value.status == '') || (searchForm.value.searchText == null && searchForm.value.status == null)) {
      this.getProjects();
      return;
    }

    this.setSavedValue(searchForm.value.searchText, searchForm.value.status);

    this.projectService
      .searchProjects(searchForm.value.searchText ? searchForm.value.searchText : '', searchForm.value.status ? searchForm.value.status : '')
      .subscribe(
        (response: Project[]) => {
          console.log('day la search');
          console.log(response);
          this.projects = response;
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          if (error.status == 404) {
            this._toastService.info('Project not found');
          }else{
            this._toastService.error(error.message);
          }
        }
      );
  }

  public resetSearchHandle(searchForm: NgForm) {
    this.setSavedValue('', '');
    searchForm.form.patchValue({
      searchText: '',
      status: '',
    });
    this.getProjects();
  }

  public setProjectIdDelete(projectId: number) {
    this.deleteProjectId = projectId;
  }

  public deleteProject(projectId: number): void {
    this.projectService.deleteProject(projectId).subscribe(
      (response: void) => {
        console.log(response);
        this.getProjects();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );

    this.selectedItems = [];
  }

  public deleteSelectedProject(): void {
    this.selectedItems.forEach((project) => {
      this.projectService.deleteProject(project.id).subscribe(
        (response: void) => {
          console.log(response);
          this.getProjects();
        },
        (error: HttpErrorResponse) => {
          console.log(project.id);
          alert(error.message);
        }
      );
    });

    this.selectedItems = [];
  }

  toggleSelection(project: Project) {
    if (this.isSelected(project)) {
      this.selectedItems = this.selectedItems.filter(
        (item) => item.id !== project.id
      );
    } else {
      this.selectedItems.push(project);
    }
    console.log(this.selectedItems);
  }

  isSelected(project: Project) {
    return this.selectedItems.some((item) => item.id === project.id);
  }

  navigateToUpdateProject(project: Project) {
    this.router.navigate(['/update', project.projectNumber]);
  }

  navigateToProjectDetail(project: Project) {
    this.router.navigate(['/project', project.projectNumber]);
  }

  changeIsUpdate(val: boolean) {
    this.sharedService.setIsUpdate(val);
  }

  formatDate(date: Date): string | null {
    return this.sharedService.formatDate(date);
  }

  public setSavedValue (searchText: any, status: any) {
    this.sharedService.setSavedSearchText(searchText);
    this.sharedService.setSavedSatus(status);
    this.savedStatus = this.sharedService.getSavedSatus();
    this.savedSearchText = this.sharedService.getSavedSearchText();
  }
}
