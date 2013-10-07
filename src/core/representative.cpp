#include "representative.h"
#include "kmerstore.h"
#include "read_score.h"
#include "read_chooser.h"

#include <iostream>
using namespace std;

RepresentativeComputer::RepresentativeComputer(list<Sequence> &r)
  :sequences(r),is_computed(false),representative() {
}

Sequence RepresentativeComputer::getRepresentative() const{
  assert(hasRepresentative());
  return representative;
}

list<Sequence>& RepresentativeComputer::getSequenceList() const{
  return sequences;
}

bool RepresentativeComputer::hasRepresentative() const{
  return is_computed;
}


string KmerRepresentativeComputer::getSeed() const{
  return seed;
}

void KmerRepresentativeComputer::setSeed(string seed) {
  this->seed = seed;
}

int KmerRepresentativeComputer::getStabilityLimit() const {
  return stability_limit;
}

void KmerRepresentativeComputer::setStabilityLimit(int limit) {
  stability_limit = limit;
}

KmerRepresentativeComputer::KmerRepresentativeComputer(list<Sequence> &r,
                                                       string seed)
  :RepresentativeComputer(r),seed(seed),stability_limit(DEFAULT_STABILITY_LIMIT){}
  
void KmerRepresentativeComputer::compute(bool do_revcomp, size_t min_cover, 
                                         float percent_cover) {
  is_computed = false;

  // First create an index on the set of reads
  IKmerStore<Kmer> *index = new MapKmerStore<Kmer>(getSeed(), do_revcomp);

  // Add sequences to the index
  for (list<Sequence>::iterator it=sequences.begin(); it != sequences.end(); ++it) {
    index->insert(it->sequence, it->label);
  }
  
  size_t max = sequences.size();
  // Create a read chooser to have the sequences sorted by length
  ReadLengthScore *rlc = new ReadLengthScore();
  ReadChooser rc(sequences, *rlc);
  delete rlc;

  // Traverse the sequences to get the desired representative
  size_t pos_longest_run = 0;
  size_t length_longest_run = 0;
  size_t seq_index_longest_run = 1;
  Sequence sequence_longest_run;
  size_t k = getSeed().length();

  for (size_t seq = 1; seq <= sequences.size() && seq <= seq_index_longest_run + stability_limit ; seq++) {
    Sequence sequence = rc.getithBest(seq);
    if (sequence.sequence.size() <= length_longest_run) {
      break;
    }
    vector<Kmer> counts = index->getResults(sequence.sequence);

    for (size_t i =0; i < counts.size(); i++) {
      size_t length_run = 0;
      // Search the longest "run" of consecutive k-mers that are sufficiently
      // expressed in the read collection.
      while (i < counts.size()
             && counts[i].count >= min_cover 
             && counts[i].count >= max*percent_cover) {
        length_run++;
        i++;
      }
      if (length_run)
        // Take into account the whole k-mer, not just the starting positions
        length_run += k - 1;
      if (length_run > length_longest_run) {
        length_longest_run = length_run;
        pos_longest_run = i - (length_run - k + 1);
        sequence_longest_run = sequence;
        seq_index_longest_run = seq;
      }
    }
  }

  if (length_longest_run) {
    is_computed = true;
    representative = sequence_longest_run;
    representative.sequence = representative.sequence.substr(pos_longest_run, length_longest_run);
    representative.label += "-[" + string_of_int(pos_longest_run) + "," 
      + string_of_int(pos_longest_run + length_longest_run - 1) + "]";
  }
  delete index;
}
