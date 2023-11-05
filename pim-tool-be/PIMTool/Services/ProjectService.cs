﻿using PIMTool.Core.Domain.Entities;
using PIMTool.Core.Interfaces.Repositories;
using PIMTool.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;
using PIMTool.Database;

namespace PIMTool.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IRepository<Project> _repository;
        private readonly PimContext _pimContext;

        public ProjectService(IRepository<Project> repository, PimContext pimContext)
        {
            _repository = repository;
            this._pimContext = pimContext;
        }

        public async Task AddAsync(Project project)
        {
            await _repository.AddAsync(project);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(Project project)
        {
            _repository.Delete(project);
            await _repository.SaveChangesAsync();
        }

        public async Task<Project?> GetAsync(int id, CancellationToken cancellationToken = default)
        {
            //var entity = await _repository.GetAsync(id, cancellationToken);
            var entity = await _pimContext.Projects.Include(x=>x.Group.GroupLeader).FirstOrDefaultAsync(x=>x.Id == id);
            return entity;
        }

        public async Task<IEnumerable<Project>> GetProjects()
        {
            //var entities = await _repository.Get().ToListAsync();
            var entities = await _pimContext.Projects.Include(x=>x.Group.GroupLeader).OrderByDescending(y=>y.Id).ToListAsync();
            return entities;
        }

        public async Task<IEnumerable<Project>> Search(string? searchText, int? status)
        {
            if (!string.IsNullOrEmpty(searchText) && status.HasValue)
            {
                return await _pimContext.Projects.Include(x=>x.Group.GroupLeader)
                    .Where(x=>
                        (
                            x.Name.ToLower().Contains(searchText.Trim().ToLower()) 
                            || x.Customer.ToLower().Contains(searchText.Trim().ToLower()) 
                            || x.ProjectNumber.ToString().Contains(searchText.Trim().ToLower())
                        ) 
                        && x.Status == (Core.Domain.Enums.Status)status).ToListAsync();
            }else if (!string.IsNullOrEmpty(searchText) && !status.HasValue)
            {
                  return await _pimContext.Projects.Include(x=>x.Group.GroupLeader)
                    .Where(x=>x.Name.ToLower().Contains(searchText.Trim().ToLower()) 
                        || x.Customer.ToLower().Contains(searchText.Trim().ToLower()) 
                        || x.ProjectNumber.ToString().Contains(searchText.Trim().ToLower())).ToListAsync();
            }
            return await _pimContext.Projects.Include(x => x.Group.GroupLeader).Where(x => x.Status == (Core.Domain.Enums.Status)status).ToListAsync();
        }

        public async Task UpdateAsync()
        {
            await _repository.SaveChangesAsync();
        }
    }
}