const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE JSON VALIDATION STARTING...\n');

// Layer 1: Basic JSON Syntax Validation
console.log('📋 LAYER 1: JSON Syntax Validation');
try {
  const filePath = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  console.log('✅ PASSED: JSON Syntax Validation');
} catch (e) {
  console.log('❌ FAILED: JSON Syntax Validation');
  console.log('   Error:', e.message);
  process.exit(1);
}

// Layer 2: Structure Validation
console.log('\n📋 LAYER 2: JSON Structure Validation');
try {
  const filePath = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  
  // Check required root fields
  if (!data.project) throw new Error('Missing project field');
  if (!data.tags) throw new Error('Missing tags field');
  if (!data.tags.master) throw new Error('Missing master tag');
  if (!Array.isArray(data.tags.master.tasks)) throw new Error('Master tasks is not an array');
  
  console.log('✅ PASSED: JSON Structure Validation');
} catch (e) {
  console.log('❌ FAILED: JSON Structure Validation');
  console.log('   Error:', e.message);
  process.exit(1);
}

// Layer 3: Content Integrity Validation
console.log('\n📋 LAYER 3: Content Integrity Validation');
try {
  const filePath = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  
  const tasks = data.tags.master.tasks;
  
  // Check each task has required fields
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task.id) throw new Error(`Task ${i + 1} missing id`);
    if (!task.title) throw new Error(`Task ${task.id} missing title`);
    if (!task.status) throw new Error(`Task ${task.id} missing status`);
    if (!task.description) throw new Error(`Task ${task.id} missing description`);
    
    // Check subtasks if they exist
    if (task.subtasks && Array.isArray(task.subtasks)) {
      for (let j = 0; j < task.subtasks.length; j++) {
        const subtask = task.subtasks[j];
        if (!subtask.id) throw new Error(`Subtask ${j + 1} in task ${task.id} missing id`);
        if (!subtask.title) throw new Error(`Subtask ${subtask.id} in task ${task.id} missing title`);
        if (!subtask.status) throw new Error(`Subtask ${subtask.id} in task ${task.id} missing status`);
      }
    }
  }
  
  console.log('✅ PASSED: Content Integrity Validation');
  console.log(`   Total tasks: ${tasks.length}`);
  console.log(`   Task IDs: ${tasks.map(t => t.id).join(', ')}`);
} catch (e) {
  console.log('❌ FAILED: Content Integrity Validation');
  console.log('   Error:', e.message);
  process.exit(1);
}

// Layer 4: File System Validation
console.log('\n📋 LAYER 4: File System Validation');
try {
  const filePath = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');
  const stats = fs.statSync(filePath);
  
  if (stats.size === 0) throw new Error('File is empty');
  if (stats.size < 100) throw new Error('File seems too small');
  if (stats.size > 1000000) throw new Error('File seems too large');
  
  console.log('✅ PASSED: File System Validation');
  console.log(`   File size: ${stats.size} bytes`);
  console.log(`   Last modified: ${stats.mtime}`);
} catch (e) {
  console.log('❌ FAILED: File System Validation');
  console.log('   Error:', e.message);
  process.exit(1);
}

console.log('\n🎉 ALL VALIDATION LAYERS PASSED!');
console.log('✅ JSON file is completely error-free and ready for use!');






