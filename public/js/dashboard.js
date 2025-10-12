document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.tab-btn');
    const tasksContainer = document.getElementById('tasks-container');
  
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
  
        tasksContainer.innerHTML = '<div class="text-muted text-center my-5">Loading...</div>';
  
        const filter = button.dataset.filter || 'all';
  
        fetch(`/tasks/filter?filter=${filter}`)
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.text();
          })
          .then(html => {
            tasksContainer.innerHTML = html;
          })
          .catch(() => {
            tasksContainer.innerHTML = '<div class="text-danger text-center my-5">Error loading tasks.</div>';
          });
      });
    });
  });
  