import React, { useState } from 'react';

interface FileTreeProps {
  files: { path: string; content: string }[];
  selectedFiles: string[];
  onFileSelect: (path: string) => void;
}

interface TreeNode {
  name: string;
  children: { [key: string]: TreeNode };
  isFile: boolean;
  path: string;
}

const FileTree: React.FC<FileTreeProps> = ({ files, selectedFiles, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const buildFileTree = (files: { path: string; content: string }[]): TreeNode => {
    const root: TreeNode = { name: 'root', children: {}, isFile: false, path: '' };
    files.forEach(file => {
      const parts = file.path.split('/');
      let currentNode = root;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          currentNode.children[part] = { name: part, children: {}, isFile: true, path: file.path };
        } else {
          if (!currentNode.children[part]) {
            currentNode.children[part] = { name: part, children: {}, isFile: false, path: parts.slice(0, index + 1).join('/') };
          }
          currentNode = currentNode.children[part];
        }
      });
    });
    return root;
  };

  const renderTree = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    return (
      <div key={node.path} style={{ marginLeft: `${level * 20}px` }}>
        {!node.isFile && (
          <div 
            className="cursor-pointer flex items-center"
            onClick={() => setExpandedFolders(prev => {
              const newSet = new Set(prev);
              if (newSet.has(node.path)) {
                newSet.delete(node.path);
              } else {
                newSet.add(node.path);
              }
              return newSet;
            })}
          >
            <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
            <span>{node.name}/</span>
          </div>
        )}
        {node.isFile && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedFiles.includes(node.path)}
              onChange={() => onFileSelect(node.path)}
              className="mr-2"
            />
            <span>{node.name}</span>
          </label>
        )}
        {isExpanded && Object.values(node.children).map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  const fileTree = buildFileTree(files);

  return <div className="mt-2">{renderTree(fileTree)}</div>;
};

export default FileTree;