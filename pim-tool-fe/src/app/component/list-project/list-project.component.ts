import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Project, Status } from 'src/app/model/project';
import { ProjectService } from 'src/app/service/project.service';
import { SharedService } from 'src/app/service/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from 'angular-toastify';

@Pipe({
  name: 'statusPipe'
})
export class StatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'INP':
        return 'In Progress';
      case 'PLA':
        return 'Planning';
      case 'NEW':
        return 'New';
      case 'FIN':
        return 'Finish';
      default:
        return 'Unknown';
    }
  }
}

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
  projectsCount: number = 0;
  pageQuantity: number = 0;
  pagesArray: number[] = [];

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private sharedService: SharedService,
    private _toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.page = this.sharedService.getPage();
    if (this.page == undefined) {
      this.page = 1;
      this.sharedService.setPage(this.page);
    }
    console.log("current page: ", this.sharedService.getPage());
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
      this.getProjectsCount();
      console.log("projects count: ", this.projectsCount);
      this.loadProjectsPagination(10, (this.page - 1) * 10);
    }
  }

  public switchPage(page: number): void {
    this.sharedService.setPage(page);
    this.page = this.sharedService.getPage();
    console.log("page: ", this.sharedService.getPage());
    this.loadProjectsPagination(10, (page - 1) * 10);
  }

  public switchPagePrevious(): void {
    if (this.sharedService.getPage() == 1) {
      return;
    }
    this.sharedService.setPage(this.sharedService.getPage() - 1);
    this.page = this.sharedService.getPage();
    console.log("page: ", this.sharedService.getPage());
    this.loadProjectsPagination(10, (this.sharedService.getPage() - 1) * 10);
  }

  public switchPageNext(): void {
    if (this.sharedService.getPage() == this.pageQuantity) {
      return;
    }
    this.sharedService.setPage(this.sharedService.getPage() + 1);
    this.page = this.sharedService.getPage();
    console.log("page: ", this.sharedService.getPage());
    this.loadProjectsPagination(10, (this.sharedService.getPage() - 1) * 10);
  }

  public getProjectsCount(): void {
    this.projectService.getProjectsCount().subscribe(
      (response: number) => {
        console.log("count: ", response);
        this.projectsCount = response;
        this.pageQuantity = Math.ceil(this.projectsCount / 10);
        this.pagesArray = this.generatePageNumbers(this.pageQuantity);
      },
      (error: HttpErrorResponse) => {
        console.log("error get projects count: ", error);
        this.navigateToErrorPage();
      }
    );
  }

  generatePageNumbers(pageQuantity: number): number[] {
    return Array.from({ length: pageQuantity }, (_, index) => index + 1);
  }

  public getProjects(): void {
    this.projectService.getProjects().subscribe(
      (response: Project[]) => {
        console.log(response);

        this.projects = response;
        this.projects.sort((a, b) => a.projectNumber - b.projectNumber);
      },
      (error: HttpErrorResponse) => {
        console.log("error get projects: ", error);
        this.navigateToErrorPage();
      }
    );
  }

  public loadProjectsPagination(limit: number, skip: number): void {
    this.projectService.getProjectsPagination(limit, skip).subscribe(
      (response: Project[]) => {
        console.log("pagi projects: ", response);

        this.projects = response;
        this.projects.sort((a, b) => a.projectNumber - b.projectNumber);
      },
      (error: HttpErrorResponse) => {
        console.log("error get projects pagination: ", error);
        this.navigateToErrorPage();
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
          console.log("error search projects: ", error);
          this.navigateToErrorPage();
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
          } else {
            console.log("error search projects: ", error);
            this.navigateToErrorPage();
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
    this.loadProjectsPagination(10, 0);
  }

  public setProjectIdDelete(projectId: number) {
    this.deleteProjectId = projectId;
  }

  public deleteProject(projectId: number): void {
    this.projectService.deleteProject(projectId).subscribe(
      (response: void) => {
        console.log(response);
        this.getProjectsCount();
        this.loadProjectsPagination(10, 0);
      },
      (error: HttpErrorResponse) => {
        console.log("error delete single projects: ", error);
        this.navigateToErrorPage();
      }
    );

    this.selectedItems = [];
  }

  public deleteSelectedProject(): void {
    this.selectedItems.forEach((project) => {
      this.projectService.deleteProject(project.id).subscribe(
        (response: void) => {
          console.log(response);
          this.getProjectsCount();
          this.loadProjectsPagination(10, 0);
        },
        (error: HttpErrorResponse) => {
          console.log(project.id);
          console.log("error delete multiple projects: ", error);
          this.navigateToErrorPage();
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

  navigateToErrorPage() {
    this.router.navigate(['/error']);
  }

  changeIsUpdate(val: boolean) {
    this.sharedService.setIsUpdate(val);
  }

  formatDate(date: Date): string | null {
    return this.sharedService.formatDate(date);
  }

  public setSavedValue(searchText: any, status: any) {
    this.sharedService.setSavedSearchText(searchText);
    this.sharedService.setSavedSatus(status);
    this.savedStatus = this.sharedService.getSavedSatus();
    this.savedSearchText = this.sharedService.getSavedSearchText();
  }
}
