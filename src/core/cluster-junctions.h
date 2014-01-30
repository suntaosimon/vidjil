#ifndef CLUSTER_JUNCTIONS_H
#define CLUSTER_JUNCTIONS_H

#include <fstream>
#include <iostream>
#include <string>
#include <map>
#include <list>
#include <ctime>
#include "dynprog.h"
#include "windows.h"

using namespace std ;

#define SIMILAR_JUNCTIONS_THRESHOLD 1


class comp_matrix {
  public:
    char ** m;
    int size;
    WindowsStorage &windows;
    map <string, int> count;
    int n_j;
    int n_j2;
    
    /**
    * create new distance matrix
    */
    comp_matrix(WindowsStorage &windows);
        
    /**
    * init matrix with a KmerStore and compute distance value between sequences
    * @param junctions: a MapKmerStore containing sequences to be compared
    * @param out: exit for log
    */
    void compare(ostream &out, Cost cluster_cost);
    
    /**
    * init matrix with a previous run stored 
    * @param junctions: a MapKmerStore containing sequences
    * @param file: a file containing the distance value between sequences
    */
    void load(string file);
    
    /**
    * store matrix in a file for future use
    * @param file: a filename to store the distance value between sequences
    */
    void save( string file);
    
    /**
    * @return cluster 
    * @param junctions: a MapKmerStore containing sequences to be clusterized
    * @param forced_edges: force some sequences to be in the same cluster
    * @param w: junctions size
    * @param out: exit for log
    * @param epsilon: maximum neighborhood distance 
    * @param minPts: minimum neighbors required 
    */
    list<list<junction> >  cluster(string forced_edges="",
					int w=0,ostream &out=cout,
					int epsilon=1, int minPts=10);
    
    list<list<junction> >  nocluster();
    
    /**
    * reset state 
    */
    void del();
    
    void stat_cluster( list<list<junction> > cluster, string neato_file, ostream &out=cout);

 private:
    
    /**
     * Allocates a matrix of size s * s bytes
     */
    char **alloc_matrix(size_t s);
};

#endif
